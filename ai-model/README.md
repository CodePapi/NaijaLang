<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

## AI Model Prototype

This application hosts a simple in-memory translation prototype powered by NestJS. The API exposes endpoints for languages, training examples, and a translation model that is **100% self‑contained** (no external AI services are required). Each language now includes a **two‑letter `code`** (e.g. `en` for English, `yo` for Yoruba) which is unique and can be used interchangeably with the name when querying the `/languages/:identifier` endpoint.

Languages are normally stored in the database (seeded on first run), but to make development easy the service will return the list bundled with the
[`nigeria-languages`](https://www.npmjs.com/package/nigeria-languages) npm package if the database is not reachable or contains no rows.  This means the frontend can always fetch `/languages` even before you've started Postgres or run the migration/seed commands.  Training examples, however, do require a functioning database because they are persisted.

When using a cloud LLM for translation the server inspects the model's output and
if it appears to be a placeholder such as "hello in Hausa", consists solely
of non‑Latin characters, or is just the original text unchanged it will
respond with a helpful message telling the user to visit the training page
and submit examples.  That way the UI won't blindly trust garbage text for
under‑represented languages.

The prompt sent to OpenAI is now **strict**: it explicitly tells the model
that the only valid targets are English or one of the Nigerian languages in
the dataset.  If the model attempts to translate to an unrelated language or
cannot produce a real translation it is instructed to reply "I don't know."

On the backend, a placeholder or unknown output results in a `400` error with
a clear message.  The frontend displays this message in the training area so
users are encouraged to keep contributing examples.  This prevents situations
where a stray code such as `np` would cause Nepali text to slip through – the
service now refuses and asks for more training data.

The prompt sent to the LLM now also explicitly asks for Latin script output
and tells the model to reply "I don't know" if it cannot translate.  This
helps prevent the problem you saw where the model returned characters from
another writing system even though the input was plain English.

The translation logic has been improved with a basic local embedding algorithm — word‑hashing + normalization — so that new examples populate a vector store in PostgreSQL and nearest‑neighbor retrieval is used for queries. Fallbacks still include Levenshtein fuzzy matching and finally a first-example prefix. This design keeps everything on‑device, preserving privacy and making the project easier for contributors to run.

### Useful endpoints

> **Cloud LLM support**
> 
> If you provide an `OPENAI_API_KEY` in your `.env`, the service will use
> OpenAI's embedding endpoint when examples are added and will attempt a
> model‑based translation before falling back to the local vector/Levenshtein
> logic.  This makes the prototype production ready: just sign up for a free
> key, set the variable, and restart the server.  The default model used is
> `gpt-3.5-turbo` for translation and `text-embedding-3-small` for
> embeddings, but you can change those in `src/utils/openai.ts` if desired.
> 

### Useful endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | /languages | List all available languages |
| GET    | /languages/:name | Get metadata for a language |
| GET    | /languages/:code | Get metadata by two‑letter code (same as name lookup) |
| POST   | /training | Add a training example (JSON body) |
| POST   | /training/batch | Add multiple training examples in one request (array) |
| GET    | /training | List all training examples |
| GET    | /training/:source/:target | Examples for a language pair |
| POST   | /model/translate | Translate text using current training data |

Start the server with:

```bash
cd ai-model
npm install
npm run start:dev
```

The frontend expects the backend to be reachable at the same origin by default, but you can override it by setting `VITE_API_BASE_URL` when building the frontend. For example:

```bash
cd frontend
VITE_API_BASE_URL="http://localhost:3000" npm run build
```

This will cause the React app to prefix all API calls with the given base URL.

### Database setup (optional)

#### Local embeddings
When training examples are added via the `/training` endpoints, the server automatically computes a simple embedding vector from the source text using an internal word‑hash algorithm, then stores it alongside the record. The `/model/translate` route uses these vectors for a nearest‑neighbor lookup before falling back to fuzzy matching. All of this runs purely inside the application and database — no paid API keys or external models are required.

### Fine‑tuning
The service exposes an administrative endpoint `POST /model/fine-tune` which
will package the current training examples into a JSONL file and request a
fine‑tune from OpenAI (requires `OPENAI_API_KEY`). A helper script is also
provided in `scripts/fine-tune.ts` that can be invoked from a cron job or CI:

```bash
cd ai-model
npx ts-node scripts/fine-tune.ts
```

Running this script or hitting the endpoint will return a message such as
`fine-tune started: ft-abc123` – or, if the OpenAI SDK installed in your
workspace is too old or lacks the `fineTunes` API, the response will instead
contain `fine-tune not supported by installed OpenAI SDK`.  The service no
longer logs any warning for this case; the client sees the message and can
handle it accordingly.  You should schedule fine-tunes periodically (daily,
weekly, or when the dataset reaches a threshold) to keep the model weights
aligned with newly submitted examples.  The returned message is safe to ignore
if you don't plan to fine‑tune or simply indicates that you need to upgrade
`openai` to a compatible version (e.g. `npm install openai@^4.4.0`).

Example cron entry (UNIX) to run nightly at 2 AM:

```cron
0 2 * * * cd /path/to/ai-model && \
  export DATABASE_URL="postgresql://..." && \
  npm run prisma:migrate && \
  npx ts-node scripts/fine-tune.ts >> /var/log/naijalang-finetune.log 2>&1
```

Adjust paths and environment variables for your deployment.

## Language data
The list of supported Nigerian languages now comes from the published
`nigeria-languages` npm package (see https://www.npmjs.com/package/nigeria-languages).
When the database is empty the service will return the package list
immediately, and the Prisma seed script also pulls from the package if
installed, falling back to the workspace `lang.json` file.  This keeps the
front end and ai-model service in sync with the canonical language dataset.

> **Code collisions** ⚠️
> 
> Each language in that package has a **two‑letter `code`** (e.g. `en`, `yo`,
> `np`, `m4`, …).  These are essentially arbitrary identifiers chosen by the
> package authors and are not guaranteed to align with international ISO
> codes.  For example, `np` in our dataset refers to **Nigerian Pidgin**, not
> Nepali; `m4` refers to **Mandara**.  Our backend normalizes all incoming
> identifiers using the package list (see `src/utils/languages.ts`), so
> clients may pass either the code or the full language name when calling
> `/model/translate` or submitting training examples.  The translation prompt
> always uses the human‑readable name to avoid confusion.
> 
> If you ever need to adjust or rename codes in the future (to avoid
> collisions or meet a different convention), you can simply edit the
> `nigeria-languages` directory in this repo and update the DB via the
> `seedFromFile` or `prisma` tools.


To enable persistence with PostgreSQL and pgvector:

```bash
# start a local Postgres instance with pgvector enabled
cd ai-model
# make sure Docker is running on your machine
# the compose file now defaults the host port to 5433 to avoid clashes
# with a typical local Postgres on 5432; override with PGHOST_PORT if
# you need a different port (e.g. `export PGHOST_PORT=15432`).
docker-compose up -d

# set DATABASE_URL variable for prisma, e.g. in .env
# DATABASE_URL="postgresql://prisma:prisma@localhost:5432/ai_model"
# (adjust host port if you changed PGHOST_PORT above)
# also ensure Prisma uses the binary engine or a suitable adapter
# you can export PRISMA_CLIENT_ENGINE_TYPE=binary

npm run prisma:migrate   # creates and applies migration based on schema
npm run prisma:seed      # load languages from root lang.json
```

**Port conflict warning:** the Nest server listens on port `3000` by default. If another process is already bound to that port you'll see an `EADDRINUSE` error and subsequent requests may return 500 (or hit the wrong service). To fix:

```bash
# kill whatever is listening
lsof -iTCP:3000 -sTCP:LISTEN
kill <pid>

# or run on a different port
PORT=3001 npm run start:dev
```

Then try the API endpoints again.

Before running the app you must also have the Postgres adapter installed (`npm install @prisma/adapter-pg`), which is already included in dependencies. The PrismaService constructor uses this adapter when instantiating the client so startup succeeds. It also ensures the underlying pg pool is always given a string password (possibly an empty string) to avoid SASL validation errors when no database URL is configured.

Create a `.env` file in the `ai-model` folder containing at least the following values (defaults are shown):

```dotenv
DATABASE_URL="postgresql://prisma:prisma@localhost:5433/ai_model"
PORT=3000
PRISMA_CLIENT_ENGINE_TYPE=binary
PGHOST_PORT=5433    # used by docker-compose
```

You can adjust any of these if your setup differs; the server and docker compose will read from the file.

There are also three handy scripts in the repository:

* `scripts/generate-language-table.js` – rebuilds `LANGUAGE_CODES.md` with names & codes.
* `scripts/generate-training.js` – produces a simple `training-sample.json` dataset (English→everyone else).
* `scripts/import-training.ts` – runs inside the ai-model context and bulk‑imports a JSON file of examples directly into the database.  Example:

```bash
cd ai-model
# generate or supply a JSON file containing an array of training examples
npx ts-node scripts/import-training.ts ../training-sample.json
```

You can then start the server and exercise translations against the newly loaded data.

The app will automatically connect using the `DATABASE_URL` environment variable. If the database isn't available, the application will still start but language endpoints will return empty results.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

