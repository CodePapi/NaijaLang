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

This application hosts a simple in-memory translation prototype powered by NestJS. The API exposes endpoints for languages, training examples, and a translation model that is **100% self‑contained** (no external AI services are required). Each language now includes a **two‑letter `code`** (e.g. `en` for English, `yo` for Yoruba) which is unique and can be used interchangeably with the name when querying the `/languages/:identifier` endpoint. Languages are stored in the database (seeded from the root `lang.json` file), and training examples are persisted as well. 

The translation logic has been improved with a basic local embedding algorithm — word‑hashing + normalization — so that new examples populate a vector store in PostgreSQL and nearest‑neighbor retrieval is used for queries. Fallbacks still include Levenshtein fuzzy matching and finally a first-example prefix. This design keeps everything on‑device, preserving privacy and making the project easier for contributors to run.

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

### Database setup (optional)

#### Local embeddings
When training examples are added via the `/training` endpoints, the server automatically computes a simple embedding vector from the source text using an internal word‑hash algorithm, then stores it alongside the record. The `/model/translate` route uses these vectors for a nearest‑neighbor lookup before falling back to fuzzy matching. All of this runs purely inside the application and database — no paid API keys or external models are required.


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

There are also two handy scripts in the repository:

* `scripts/generate-language-table.js` – rebuilds `LANGUAGE_CODES.md` with names & codes.
* `scripts/generate-training.js` – produces a simple `training-sample.json` dataset (English→everyone else).  Use this file to bulk load examples with the `/training/batch` endpoint and quickly populate the vector model.

The app will automatically connect using the `DATABASE_URL` environment variable. If the database isn't available, the application will still start but language endpoints will return empty results.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

