go work sync            # ensures module replacements are up to date
# Fluxion 🚀

Fluxion is an AI copilot for GitHub Actions. It pairs a context-aware CLI, a credit-managed Go backend, and a Next.js dashboard so that teams can generate and debug workflows that match their real project setup.

## Core capabilities

- 🤖 **Workflow generation** – create CI pipelines that honour detected build and test commands
- 🪄 **Workflow debugging** – explain failing runs and surface actionable fixes
- 🧠 **Context detection** – scan source trees locally (Go, Node, Python detectors today)
- 🔐 **API keys & credits** – gated access with Supabase-backed billing primitives
- 🖥️ **Web dashboard** – manage runs, credits, and API keys with NextAuth SSO

## System overview

- `backend/` – Gin API that talks to OpenAI, Supabase, and enforces credit usage
- `cli/` – Cobra CLI that shells out to the backend after scanning your repo
- `frontend/` – Next.js 16 dashboard with NextAuth, tailwind UI, and billing surfaces
- `shared/` – Go types consumed by both the CLI and backend via `go.work`

```
User ↔ Next.js dashboard ↔ Go backend ↔ OpenAI
        ↑                 ↕
        └── Fluxion CLI ───┘
```

## Using the CLI

1. Create an account in the dashboard (or seed Supabase) to obtain free credits.
2. Issue an API key from **Dashboard → Settings → API Keys**. Copy the `FLX_...` value; it is shown once.
3. Export the key and run a command:
  ```bash
  cd /path/to/your/project
  export FLUXION_KEY="FLX_xxx..."
  go run /workspaces/Fluxion/cli generate --output .github/workflows/ci.yml
  ```

The CLI scans your repository, sends the prompt and detected metadata to the backend, and writes the YAML output locally. Use `--prompt_file` to supply a pre-written brief or `--api-key` to pass the key inline.

## Using the HTTP API directly

All authenticated routes expect a bearer token issued by NextAuth (`Authorization: Bearer <jwt>`). Once authenticated you can call:

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/commands/generate` | Create a workflow; body is `GenerateRequest` |
| `POST` | `/api/commands/debug` | Analyse an existing workflow and logs |
| `GET` | `/api/users/:id` | Fetch credit balances and profile info |
| `POST` | `/api/users/:id/apikey` | Issue a Fluxion API key (returns plaintext once) |

Each generation request returns a JSON payload containing a pipeline description, YAML (`PipelineConfig`), parsed JSON (`PipelineJSON`), assumptions, and next steps. Credit balances are automatically debited using token usage and pricing configured in `internal/handlers/generate.go`.

## Contributing

Pull requests are welcome. Helpful areas include new language detectors, improved pricing models, additional pipeline targets (GitLab, CircleCI), and local LLM backends. Please open an issue first for large changes.

## Support

- 🐛 [GitHub Issues](https://github.com/AlexandreFigueired0/Fluxion/issues)
- 💬 [GitHub Discussions](https://github.com/AlexandreFigueired0/Fluxion/discussions)

Built with ❤️ by [Alexandre Figueiredo](https://github.com/AlexandreFigueired0)