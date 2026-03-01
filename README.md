# NaijaLang 🇳🇬

**Open‑source Nigerian language translation & training platform**

This monorepo contains everything needed to run a self‑contained AI service for
translating and training on Nigerian languages. It started as a simple proof‑of‑concept
and has grown into a full‑stack project with API, frontend UI, helper packages,
and CI automation.

---

## What we're building

- A NestJS‑powered backend (`ai-model/`) that stores examples and generates
  translations using local embeddings and a lightweight model.
- A React/Vite frontend (`frontend/`) with pages for translating text and
  submitting training examples.
- A Next.js proxy backend (`backend/`) that exposes the AI service to the web.
- A standalone npm package (`nigeria-languages`) providing a list of
  supported Nigerian languages for reuse in other projects.
- Comprehensive tests (unit & e2e) and Docker/Prisma setup for development.
- GitHub Actions workflows for CI, including automated publishing of the
  language package.

## Achievements so far ✅

- **Self‑contained model**: no external AI provider. Embeddings run locally using
  cosine similarity and TF‑IDF.
- **Language support**: seeded with dozens of Nigerian languages and growing.
- **Training UI**: users can submit real examples and have them stored persistently.
- **Reusable package**: `nigeria-languages` is now published to npm at
  [npmjs.com/package/nigeria-languages](https://www.npmjs.com/package/nigeria-languages).
- **CI/CD**: automated tests and package publishing via GitHub Actions.
- **Open source**: the code is licensed under MIT and public on GitHub.

## Work in progress 🔧

- Improve model quality and performance (currently rudimentary embeddings).
- Add more robust authentication/authorization to the API.
- Expand frontend with documentation, bulk training uploads, and user accounts.
- Set up a hosted demo and database migration strategy for production.
- Broaden language coverage with community contributions.

## Contributing 🤝

We welcome help! Here’s how you can get involved:

1. **Fork the repo** and create a feature branch (`feature/my-change`).
2. **Run the services locally**:
   - `cd ai-model && npm install && npm run dev` (requires Postgres)
   - `cd frontend && npm install && npm run dev`
   - Optionally `cd backend && npm install && npm run dev` for proxy.
3. **Write tests** for new features/bug fixes. We use Jest and Supertest.
4. **Open a pull request** against `main`. Describe your changes and link any
   relevant issues.
5. Follow the [MIT license](#license) and be respectful in discussions.

### Reporting issues

Please open GitHub issues for bugs, feature requests, or questions. Label them
appropriately (e.g. `bug`, `enhancement`, `documentation`).

## License 🛡️

This project is licensed under the **MIT License**. See [LICENSE](LICENSE)
for details.

## Future possibilities 🌍

With community support and continued development, NaijaLang could become a
community‑trained translation engine for African languages. Potential future
features include:

- Offline mobile apps with built‑in models.
- Integration with chatbots and voice assistants.
- Crowdsourced language training data and quality metrics.
- A federated network of nodes sharing and improving models securely.

Every contribution brings us closer to empowering speakers of underrepresented
languages with accessible AI tools. Let's build it together!
