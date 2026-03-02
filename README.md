# NaijaLang 🇳🇬

**Open‑source toolkit for Nigerian language translation and training**

NaijaLang is a community‑driven, open source project that provides a
lightweight translation service for Nigerian languages.  It is distributed as
a monorepo to keep related components together, but each part can be used on
its own.

This repository serves three audiences:

* **Developers** who want to run or extend the translation API.
* **Contributors/linguists** who wish to supply training examples through a
  simple web UI.
* **Consumers of language data** – the `nigeria-languages` npm package is
  published separately and used by other projects.


## Structure of the repository

| Directory             | Contents & purpose                                                        |
|-----------------------|---------------------------------------------------------------------------|
| `ai-model/`           | NestJS application. API
|                       | for translations and example storage; integrates with Postgres/pgvector
|                       | and optionally OpenAI for inference/fine‑tuning.                         |
| `frontend/`           | React/Vite client providing translation and training pages.              |
| `nigeria-languages/`  | npm package that exports the authoritative list of languages and codes.  |


Components may be installed independently (see each package’s README).

---

## Key features

* **Retrieval‑augmented translation** using local vector embeddings or external
  LLMs (OpenAI) when an API key is provided.
* **Language code support** based on the `nigeria-languages` dataset; codes
  such as `np` (Nigerian Pidgin) or `m4` (Mandara) are recognised and
  normalized.  The system rejects requests for languages outside this set.
* **User training interface** – the frontend allows easy submission of single
  or bulk examples and provides feedback when more data is needed.
* **Public npm package** – `nigeria-languages` is published and used by
  others; it is seeded automatically into the API database if installed.
* **Full test coverage** – unit and e2e tests run on every CI build.
* **Minimal external dependencies** – everything runs locally with Postgres;
  only OpenAI is optional for better accuracy.

---

## Getting started

### Prerequisites

* Node.js 18+ (using nvm is recommended)
* PostgreSQL with the `pgvector` extension installed.

### Install workspace

```bash
npm install          # installs deps for all packages
```

### Environment

Copy `ai-model/.env.example` to `ai-model/.env` and adjust the variables:

```ini
DATABASE_URL="postgresql://prisma:prisma@localhost:5433/ai_model"
PORT=3000
OPENAI_API_KEY=       # optional, for using OpenAI
PGHOST_PORT=5433      # if you run the included Docker Compose
```

### Database and seed

```bash
cd ai-model
docker-compose up -d            # starts Postgres on port 5433
npm run prisma:migrate          # create tables
npm run prisma:seed             # seed languages from package
```

### Run locally

```bash
# api
cd ai-model && npm run start:dev
# frontend
cd frontend && npm run dev
```

The frontend defaults to calling `http://localhost:3000`; override with
`VITE_API_BASE_URL` in env when building.

### Run tests

```bash
npm run test              # runs unit + e2e across the workspace
```

---

## Using the language package

The `nigeria-languages` directory contains JSON data and a simple CommonJS
wrapper.  It is published to npm under the same name – the version in this
repo is kept in sync with the published one.  To update the list:

```bash
cd nigeria-languages
npm version patch          # or minor/major
npm publish
```

Consumers can import the list directly (`import langs from 'nigeria-languages'`).

---

## Contributing

All code is covered by the MIT license.  Contributions follow a standard
fork/branch/PR workflow:

1. Fork and create a descriptive branch.
2. Add new behaviour with tests (Jest).
3. Run `npm run lint` and `npm run test` at root; ensure all packages build.
4. Open a pull request and describe the change.

For non‑code contributions (data, documentation), feel free to open an issue
first to discuss.

---

## License

This project is available under the **MIT License**. See [LICENSE](LICENSE).

---

NaijaLang is built for the long term: community, collaboration and quality are
its guiding principles.  If you find it useful or wish to extend it, jump in!

Each package has its own `package.json`, TypeScript configuration, and
build/test commands.  The root workspace is configured as an npm workspace so
typing `npm install` in the root installs dependencies for all sub‑packages.

## Key features

* **Hybrid translation engine** – examples are stored in Postgres with
evectors; the API first attempts a retrieval‑augmented answer via OpenAI when
an API key is provided, otherwise falls back to local embeddings, fuzzy
matching and the first example.
* **Strong language code support** – all identifiers are normalised using the
`nigeria-languages` dataset so codes like `np` (Nigerian Pidgin) or `m4`
(Mandara) work seamlessly, and the system will reject unrelated codes.
* **Robust prompt engineering** – the LLM is explicitly told to translate only
between English and a Nigerian language; any invalid output triggers a 400
error with a training hint.
* **Frontend training UI** – contributors can submit single or bulk examples
(including file upload) and trigger fine‑tuning.  The UI shows language codes
beside names and displays helpful messages when the model asks for more data.
* **Reusable language list** – the `nigeria-languages` npm package is published
and automatically seeded into the database; it can be consumed by other
projects.
* **Full test coverage** – unit tests for services + controllers and e2e tests
for the API.  CI workflows run the tests and publish the language package on
github releases.
* **Docker/Prisma support** – a `docker-compose.yml` spins up Postgres with
pgvector; Prisma migrations and seeds are included.

## Getting started (development)

### Prerequisites

* Node.js 18+ (we recommend using nvm or similar)
* PostgreSQL (local or remote) – the compose file defaults to port 5433 to
  avoid conflicts with a host database.
* [pnpm](https://pnpm.io) or npm; workspace tooling works with both.

### Install dependencies

```bash
# from repo root
npm install
```

### Environment

Create a `.env` file in `ai-model/` with at least:

```
DATABASE_URL="postgresql://prisma:prisma@localhost:5433/ai_model"
PORT=3000
PGHOST_PORT=5433        # used by docker-compose
OPENAI_API_KEY=         # optional; add for cloud inference/fine-tune
```

You can also create a `.env` in `backend/` mirroring `ai-model/` if you run
the proxy app.

### Database setup

```bash
cd ai-model
docker-compose up -d              # start postgres+pgvector
npm run prisma:migrate            # apply schema
npm run prisma:seed               # load languages from package/lang.json
```

If you prefer to use an existing database, set `DATABASE_URL` accordingly and
omit Docker.

### Running the services

```bash
# backend service (api + training logic)
cd ai-model && npm run start:dev

# frontend (local dev server, supports HMR)
cd frontend && npm run dev

# optional proxy (bundles frontend + API)
cd backend && npm run dev
```

The frontend defaults to calling `http://localhost:3000`.  Override with
`VITE_API_BASE_URL` at build time if the API runs elsewhere.

## Production deployment

Deployment depends on your infrastructure, but the basic steps are:

1. Provision a Postgres database with pgvector support.
2. Set environment variables (`DATABASE_URL`, `OPENAI_API_KEY` if used,
   `PORT`, etc.).
3. Build and run `ai-model` (ts-node/pm2/Docker) and serve the frontend from
   any static host.  Alternatively, deploy `backend/` on Vercel/Netlify and it
   will automatically start the API and serve the UI.
4. Optionally schedule `scripts/fine-tune.ts` via cron/CI to keep the OpenAI
   model updated.

Detailed Docker manifests and production‑grade orchestration are left as
future work; the architecture is intentionally decoupled so you can swap in
Kubernetes, ECS, or any other environment.

## Working with the language package

The `nigeria-languages` folder is a private workspace package that exports the
same JSON used by the backend.  After editing its list you can run:

```bash
cd nigeria-languages
npm version patch          # bump version
npm publish                # requires npm login
```

The API will load the package at runtime or fall back to `lang.json` when the
package isn't installed.  If you change codes that conflict with other
standards, update the README note about collisions.

## Development workflow

Run all tests with:

```bash
npm run test            # runs unit + e2e across packages
```

Linting and formatting are handled by ESLint/Prettier; run
`npm run lint` in a package to check.  CI workflows already enforce style and
run the tests on each push/PR.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for a step‑by‑step guide (or follow the
short instructions below):

1. Fork and create a branch.
2. Add tests for your feature or bugfix.
3. Run `npm run test` and `npm run lint`.
4. Open a pull request against `main` with a clear description.

Please keep commits focused, use conventional commit messages if possible, and
be prepared to iterate on reviews.

## Tips for training contributors

- Use the frontend training page – select a source/target pair and either
  type one translation, paste many lines in the bulk box, or upload a
  JSON/CSV file.
- When a language appears in the dropdown with a code like `(np)` or `(m4)`
  it means it's extremely under‑represented; those are the ones that most
  urgently need examples.
- If the translation button returns a red training‑hint message instead of
  a result, that means the model didn't know the answer; please **add
  examples** for that pair.
- Avoid saving examples where the source and target text are identical;
  these are interpreted as placeholders and will trigger a training hint.
- Codes are flexible: you can refer to a language by its name (`"Mandara"`)
  or its two‑letter code (`"m4"`) interchangeably.

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE)
for full terms.

---

*NaijaLang* aims to democratise AI for Africa’s rich tapestry of languages.  By
structuring the code as a monorepo with clear boundaries and comprehensive
automation, we make it easy for developers and communities to collaborate and
deliver real impact.  Let's continue building together.  🇳🇬
