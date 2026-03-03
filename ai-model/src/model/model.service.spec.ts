import { Test, TestingModule } from '@nestjs/testing';
import { ModelService, isPlaceholder } from './model.service';
import { TrainingService } from '../training/training.service';
import { normalizeLang } from '../utils/languages';

// prevent actual OpenAI network calls during unit tests. we will grab the
// mocked function later, after jest has hoisted the mock.
jest.mock('../utils/openai', () => ({
  translateWithOpenAI: jest.fn().mockResolvedValue(null),
}));

// helper to access the mocked implementation
function getTranslateMock(): jest.Mock {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../utils/openai').translateWithOpenAI;
}



describe('ModelService', () => {
  let service: ModelService;
  let fakeTraining: Partial<TrainingService>;

  beforeEach(async () => {
    // avoid invoking cloud API during unit tests
    process.env.OPENAI_API_KEY = '';
    fakeTraining = {
      findFor: jest.fn().mockResolvedValue([
        { source: 'hello', target: 'hola', embedding: [0, 1, 0] },
      ]),
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelService,
        { provide: TrainingService, useValue: fakeTraining },
      ],
    }).compile();

    service = module.get<ModelService>(ModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns exact match', async () => {
    const out = await service.translate('hello', 'en', 'es');
    expect(out).toBe('hola');
  });

  it('falls back to example when no exact match', async () => {
    // because OPENAI_API_KEY is empty, the LLM call is skipped and we should
    // fall through to fuzzy/levenshtein logic
    const out = await service.translate('hell', 'en', 'es');
    expect(out).toBe('hola');
  });

  it('throws if the only example has identical source and target', async () => {
    fakeTraining.findFor = jest.fn().mockResolvedValue([
      { source: 'foo', target: 'foo', embedding: [0, 0, 0] },
    ]);
    await expect(service.translate('foo', 'en', 'es')).rejects.toThrow(
      /don't have a proper/i,
    );
  });

  describe('placeholder detection', () => {
    it('flags unchanged output', () => {
      expect(isPlaceholder('hello', 'hello', 'English')).toBe(true);
    });
    it('flags "in <lang>" text', () => {
      expect(isPlaceholder('hello in hausa', 'hello', 'Hausa')).toBe(true);
    });
    it('flags non-latin result', () => {
      expect(isPlaceholder('तिमीलाई कस्तो छ?', 'hello', 'Hausa')).toBe(true);
    });
    it('flags output with exotic characters such as accents', () => {
      expect(isPlaceholder('iñga họ?', 'hello', 'Mbube-west')).toBe(true);
    });
    it('allows good translation', () => {
      expect(isPlaceholder('sallama', 'hello', 'Hausa')).toBe(false);
    });
  });

  describe('fineTune', () => {
    it('returns message when no API key', async () => {
      delete process.env.OPENAI_API_KEY;
      const res = await service.fineTune();
      expect(res).toMatch(/no API key/i);
    });

    it('returns proactive message when no examples', async () => {
      // simulate db present but empty
      fakeTraining.findAll = jest.fn().mockResolvedValue([]);
      process.env.OPENAI_API_KEY = 'fake';
      const res = await service.fineTune();
      expect(res).toMatch(/no training examples/i);
    });

    it('normalization works when calling translate', async () => {
      // clear previous data and make translateWithOpenAI record args
      const translateMockFn = getTranslateMock();
      translateMockFn.mockClear();
      // provide a fake example for code-based lookup
      fakeTraining.findFor = jest.fn().mockResolvedValue([
        { source: 'hello', target: 'hola', embedding: [0, 1, 0] },
      ]);

      // call with a code identifier for Nigerian Pidgin
      const out1 = await service.translate('hello', 'np', 'es');
      expect(out1).toBe('hola');
      // call with the full name, should behave the same
      const out2 = await service.translate('hello', 'Nigerian Pidgin', 'es');
      expect(out2).toBe('hola');

      // also try a numeric-style code that lives in the package (Mandara)
      fakeTraining.findFor = jest.fn().mockResolvedValue([
        { source: 'foo', target: 'bar', embedding: [0, 0, 0] },
      ]);
      const out3 = await service.translate('foo', 'm4', 'en');
      expect(out3).toBe('bar');

      // ensure the prompt sent to OpenAI (when it was invoked) used names
      expect(translateMockFn).toHaveBeenCalled();
      const [text, srcName, tgtName] = translateMockFn.mock.calls[0];
      expect(srcName.toLowerCase()).toContain('nigerian pidgin');
      // one of the calls should have used the Mandara name
      const foundMandara = translateMockFn.mock.calls.some(
        (c: any[]) => typeof c[1] === 'string' && c[1].toLowerCase().includes('mandara'),
      );
      expect(foundMandara).toBe(true);
      expect(tgtName).toBeDefined();
    });

    it('throws when AI returns a placeholder result', async () => {
      const translateMockFn = getTranslateMock();
      translateMockFn.mockClear();
      fakeTraining.findFor = jest.fn().mockResolvedValue([
        { source: 'hello', target: 'hola', embedding: [0, 1, 0] },
      ]);
      translateMockFn.mockResolvedValue('hello in Hausa');
      await expect(service.translate('hello', 'en', 'ha')).rejects.toThrow(
        /don't have a proper Hausa translation/i,
      );
    });

    it('throws training hint when no examples exist', async () => {
      fakeTraining.findFor = jest.fn().mockResolvedValue([]);
      await expect(service.translate('foo', 'yo', 'en')).rejects.toThrow(
        /don't have a proper English translation/i,
      );
    });

    it('reports unsupported SDK when fineTunes missing', async () => {
      // create a dummy OpenAI module that has no fineTunes property
      jest.mock('openai', () => ({ default: jest.fn(() => ({})) }));
      process.env.OPENAI_API_KEY = 'fake';
      fakeTraining.findAll = jest.fn().mockResolvedValue([
        { source: 'a', target: 'b', embedding: [0, 0, 0] },
      ]);

      // reinitialize service to pick up the mocked openai
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ModelService,
          { provide: TrainingService, useValue: fakeTraining },
        ],
      }).compile();
      service = module.get<ModelService>(ModelService);

      const res = await service.fineTune();
      expect(res).toMatch(/not supported by installed OpenAI SDK/i);
    });
  });
});
