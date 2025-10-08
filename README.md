# Fluxion 🚀

AI-powered toolkit for generating and debugging GitHub Actions workflows with intelligent project awareness. Fluxion ships as a CLI backed by a lightweight API server so you can build, iterate, and fix CI pipelines in minutes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://go.dev)

---

## ✨ Highlights

- **🤖 AI-Powered Generation** – Tailors GitHub Actions workflows to your repository
- **🔍 Smart Project Detection** – Picks up languages, frameworks, and build/test commands automatically
- **🐛 Intelligent Debugging** – Explains workflow failures and recommends fixes
- **📊 Context-Aware** – Sends only project metadata (never your code) to the model
- **⚡ Fast & Local** – Context scanning happens instantly on your machine

## 🎯 Why Fluxion?

### Compared to manual authoring

- ⏱️ **10× faster:** minutes instead of hours
- ✅ **Best practices baked in:** tuned to 2025 GitHub Actions guidance
- 🎯 **Accurate:** leverages your real build/test commands
- 📚 **Accessible:** works for both CI beginners and power users

### Compared to generic AI prompts

- 🧠 **Repository-aware:** scans your project structure
- 🔧 **Command-precise:** avoids hallucinated build steps
- �️ **Minimal sharing:** only metadata is sent to the model

---

## 🏗️ How it Works

```
User Request → Project Scan → Context Detection → AI Generation
                    ↓              ↓                    ↓
                [go.mod]    [Language: Go]      [Enhanced Prompt]
                [package.json] [Framework: Next.js]  [with Context]
                [Dockerfile]   [Has Tests: true]     [GPT-4o API]
```

1. **Context Scanner** – Inspects repository state offline
2. **Prompt Enhancer** – Blends user request with project metadata
3. **AI Generator** – Calls OpenAI GPT-4o with JSON schema enforcement

---
## 🧭 Repository Layout

```
.
├── backend/      # Gin-powered API that talks to OpenAI
├── cli/          # Cobra-based Fluxion CLI
├── shared/       # Shared types between the CLI and backend
├── go.work       # Go workspace wiring the modules together
└── DevDockerfile # Optional devcontainer image
```

---
## 🚀 Quick Start

### 1. Install prerequisites

- Go **1.25+**
- An OpenAI API key with access to GPT-4o (`OPENAI_API_KEY`)
- (Optional) Docker, if you want to run the backend in a container

### 2. Clone and prepare the workspace

```bash
git clone https://github.com/AlexandreFigueired0/Fluxion.git
cd Fluxion
go work sync            # ensures module replacements are up to date
```

### 3. Export your OpenAI credentials

```bash
export OPENAI_API_KEY="sk-..."
```

### 4. Start the backend API

```bash
go run ./backend
```

The server boots on `http://localhost:8080` and exposes `/generate` and `/debug` endpoints.

### 5. Run the CLI against your project

```bash
# From the Fluxion repo
go run ./cli generate --output ./generated_pipeline.yml

# Or build/install the binary
cd cli
go build -o fluxion
./fluxion generate
```

Both `generate` and `debug` commands can run interactively or via flags/prompt files (details below).

---

## 📖 CLI Usage

### `fluxion generate`

Generate a workflow from scratch.

```bash
# Interactive session (prompts for pipeline description)
fluxion generate

# Provide a prompt file and output location
fluxion generate \
  --prompt_file prompt.txt \
  --output .github/workflows/ci.yml
```

What you get back:

```
🔍 Detected Project Context:
───────────────────────────────────────────────────────────────
- Primary Language: Go
- Framework: Cobra CLI
- Build Command: go build -o app
- Test Command: go test ./...
- Has Tests: true
- Package Manager: go mod
───────────────────────────────────────────────────────────────
```

### `fluxion debug`

Analyze an existing workflow alongside failing logs.

```bash
fluxion debug \
  --file .github/workflows/ci.yml \
  --logs error_logs.txt
```

Sample output:

```
🔍 Pipeline Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Root Cause:
The workflow is using deprecated Node.js 12 action versions

🔧 Fix:
- actions/checkout@v2 → actions/checkout@v4
- actions/setup-node@v2 → actions/setup-node@v4

💡 Explanation:
GitHub deprecated Node.js 12 runners in 2024. Modern actions require v4 which uses Node.js 20.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Common Flags

| Command | Flag | Description |
|---------|------|-------------|
| `generate` | `-o, --output` | Where to write the generated workflow (default `./generated_pipeline.yml`) |
| `generate` | `-p, --prompt_file` | Path to a text file describing the desired workflow |
| `debug` | `-f, --file` | Path to the workflow YAML you want to inspect |
| `debug` | `-l, --logs` | Path to a log file containing the failing run |

Both commands automatically detect your project context; warnings are surfaced if detection is incomplete so you can adjust manually.

---

## � Backend API (for automation)

The backend is a thin Gin server that powers the CLI. You can call it directly if you want to integrate Fluxion into other tooling.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate` | Generate a workflow from `{ "prompt": string, "projectContext": ProjectContext }` |
| `POST` | `/debug` | Debug an existing workflow with `{ "pipelineConfig": string, "errorLogs": string, "projectContext": ProjectContext }` |

Environment variables:

- `OPENAI_API_KEY` *(required)* – used server-side to authenticate against the OpenAI API.
- `GIN_MODE=release` *(optional)* – run the backend without debug logging.

Logs are written to `backend/server.log` by default.

---

## 🛠️ Local Development

- **Run all tests:** `go test ./...`
- **Lint/Vet (optional but recommended):** `go vet ./...`
- **Log tailing:** `tail -f backend/server.log`
- **Regenerate shared types:** see scripts under `shared/` (e.g., `go run ./shared/types/generate.go`).

Because this is a Go workspace, commands such as `go test ./...` or `go build ./cli` should be run from the repository root so that the modules share the `go.work` file.

### Dockerized backend

```bash
docker build -f backend/Dockerfile -t fluxion-backend .
docker run --rm -p 8080:8080 -e OPENAI_API_KEY="sk-..." fluxion-backend
```

Point the CLI (or your own client) at `http://localhost:8080` and you are ready to go.

---

## �💡 Real-World Examples

### Example: Go CLI Application

```bash
cd my-go-cli/
fluxion generate
# "Create a build and release workflow"
```

Produces:

- ✅ Correct Go toolchain with caching
- ✅ Module download and verification
- ✅ Cross-platform builds
- ✅ GitHub release creation
- ✅ Artifact publishing

### Example: Next.js Web App

```bash
cd my-nextjs-app/
fluxion generate
# "Build and test on pull requests"
```

- ✅ Node.js setup with the right version
- ✅ pnpm/yarn/npm awareness and caching
- ✅ Build + test steps
- ✅ PR-specific triggers

### Example: Python API

```bash
cd my-flask-api/
fluxion generate
# "Run tests and linting on every push"
```

- ✅ Python version management
- ✅ pip caching
- ✅ pytest with coverage
- ✅ Linting hooks

---

## 🤝 Contributing

We happily welcome PRs! Helpful areas:

- Additional language and framework detectors (Rust, Java, Ruby, PHP)
- Alternate CI providers (GitLab CI, CircleCI)
- Security scanning & policy guardrails
- Local LLM support and caching strategies

See open issues or start a discussion before tackling larger features.

---

## 🗺️ Roadmap

### v1.0 (Current)
- ✅ Workflow generation
- ✅ Workflow debugging
- ✅ Go / Node / Python support
- ✅ Project context detection

### v1.1 (Next)
- [ ] Enhanced prompt engineering
- [ ] More language support
- [ ] Workflow optimization
- [ ] Security scanning

### v2.0 (Future)
- [ ] Local LLM support
- [ ] GitLab CI support
- [ ] Web interface
- [ ] Team collaboration features

---

## ❓ FAQ

**Do I need an OpenAI API key?**  
No. You just need the Fluxion Key and enough credits to run your commands.

**What does it cost?**  
Fluxion itself is free. You only pay OpenAI usage fees (~$0.01–0.05 per workflow).

**Is my source code uploaded?**  
No. Only high-level metadata (language, dependencies, commands) is sent.

**Detection seems off, now what?**  
Generation still succeeds. Just tweak the resulting YAML, or rerun with additional hints.

---

## 📞 Support

- 🐛 [GitHub Issues](https://github.com/AlexandreFigueired0/Fluxion/issues)
- 💬 [GitHub Discussions](https://github.com/AlexandreFigueired0/Fluxion/discussions)

---

Built with ❤️ by [Alexandre Figueiredo](https://github.com/AlexandreFigueired0)