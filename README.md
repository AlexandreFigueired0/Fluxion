# Fluxion 🚀

AI-powered CLI tool that generates and debugs GitHub Actions workflows with intelligent project awareness.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org)

## ✨ Features

- **🤖 AI-Powered Generation**: Creates GitHub Actions workflows tailored to your project
- **🔍 Smart Project Detection**: Automatically detects languages, frameworks, and build tools
- **🐛 Intelligent Debugging**: Analyzes failed workflows and suggests precise fixes
- **📊 Context-Aware**: Understands your tech stack for accurate configurations
- **⚡ Fast & Local**: Project scanning happens instantly, offline

### Supported Languages & Frameworks

**Languages:** Go, JavaScript/TypeScript, Python

**Frameworks:** 
- Go: Cobra, Gin, Fiber, Echo, Gorilla Mux
- Node: Next.js, React, Vue.js, Angular, Express, NestJS, Vite, Svelte
- Python: Django, Flask, FastAPI, Tornado, Pyramid

---

## 🚀 Quick Start

### Installation

**Build from source:**
```bash
git clone https://github.com/AlexandreFigueired0/Fluxion.git
cd Fluxion
go build -o fluxion
sudo mv fluxion /usr/local/bin/
```

**Or download from releases** (coming soon)

### Prerequisites

Set your OpenAI API key:
```bash
export OPENAI_API_KEY="sk-..."
```

---

## 📖 Usage

### Generate a Workflow

**Interactive mode:**
```bash
cd your-project/
fluxion generate
```

**With prompt file:**
```bash
fluxion generate --prompt_file prompt.txt --output .github/workflows/ci.yml
```

**Example prompt:**
```
Create a workflow that:
- Builds and tests on every push to main
- Runs tests with coverage
- Creates a release when I tag a version
```

**What Fluxion detects automatically:**
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

### Debug a Failed Workflow

```bash
fluxion debug \
  --file .github/workflows/ci.yml \
  --logs error_logs.txt
```

**Output example:**
```
🔍 Pipeline Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Root Cause:
The workflow is using deprecated Node.js 12 action versions

🔧 Fix:
Update actions in your workflow from v2 to v4:
- actions/checkout@v2 → actions/checkout@v4
- actions/setup-node@v2 → actions/setup-node@v4

💡 Explanation:
GitHub deprecated Node.js 12 runners in 2024. Modern actions 
require v4 which uses Node.js 20.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 💡 Examples

### Example 1: Go CLI Application

```bash
cd my-go-cli/
fluxion generate
# Input: "Create a build and release workflow"
```

**Generated workflow includes:**
- ✅ Correct Go version setup with caching
- ✅ Module download and verification
- ✅ Cross-platform builds
- ✅ GitHub release creation
- ✅ Proper artifact handling

### Example 2: Next.js Web App

```bash
cd my-nextjs-app/
fluxion generate
# Input: "Build and test on pull requests"
```

**Generated workflow includes:**
- ✅ Node.js setup with correct version
- ✅ Package manager detection (npm/yarn/pnpm)
- ✅ Dependency caching
- ✅ Build and test steps
- ✅ PR-specific triggers

### Example 3: Python API

```bash
cd my-flask-api/
fluxion generate
# Input: "Run tests and linting on every push"
```

**Generated workflow includes:**
- ✅ Python version setup
- ✅ pip dependency caching
- ✅ pytest with coverage
- ✅ Linting configuration
- ✅ Appropriate triggers

---

## 🎯 Why Fluxion?

### vs. Manual Workflow Creation
- ⏱️ **10x faster**: Minutes instead of hours
- ✅ **Best practices**: Always up-to-date with 2025 standards
- 🎯 **Accurate**: Uses your actual build commands
- 📚 **No expertise needed**: Works for beginners and experts

### vs. Generic AI Tools (ChatGPT, etc.)
- 🧠 **Project-aware**: Scans your actual project structure
- 🔧 **Correct commands**: Uses your real build/test commands
- 📦 **Framework-specific**: Knows Next.js vs React vs vanilla Node
- 🚫 **No hallucinations**: Validates against actual project

---

## 🔧 Advanced Usage

### Custom Output Location
```bash
fluxion generate --output .github/workflows/custom.yml
```

### Using Prompt Files
```bash
# Create a prompt file
cat > build-prompt.txt << EOF
Create a workflow that builds on every PR and deploys to staging
EOF

fluxion generate --prompt_file build-prompt.txt
```

### Flags

**Generate command:**
- `-o, --output`: Output path (default: `./generated_pipeline.yml`)
- `-p, --prompt_file`: Path to prompt file

**Debug command:**
- `-f, --file`: Path to workflow file
- `-l, --logs`: Path to error logs

---

## 🏗️ How It Works

```
User Request → Project Scan → Context Detection → AI Generation → Validation
                    ↓              ↓                    ↓
                [go.mod]    [Language: Go]      [Enhanced Prompt]
                [package.json] [Framework: Next.js]  [with Context]
                [Dockerfile]   [Has Tests: true]     [GPT-4o API]
```

**Key Components:**
1. **Context Scanner**: Analyzes project structure (offline, fast)
2. **Prompt Enhancer**: Combines user request + project context
3. **AI Generator**: OpenAI GPT-4o with structured output
4. **Output Formatter**: Clean, actionable results

---

## 🤝 Contributing

Contributions welcome! Areas we'd love help with:

- Additional language support (Rust, Java, Ruby, PHP)
- More framework detection
- GitLab CI / CircleCI support
- Workflow optimization features
- Security scanning capabilities

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🗺️ Roadmap

### v1.0 (Current)
- ✅ Generate workflows
- ✅ Debug workflows
- ✅ Go/Node/Python support
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

**Q: Do I need an OpenAI API key?**  
A: Yes, currently Fluxion uses OpenAI's GPT-4o. Local LLM support is planned.

**Q: What does it cost?**  
A: Fluxion is free. You only pay for OpenAI API usage (~$0.01-0.05 per workflow).

**Q: Is my code sent to OpenAI?**  
A: No! Only project metadata (language, framework, commands) is sent, not your actual code.

**Q: What if detection is wrong?**  
A: Detection fails gracefully. You can always edit the generated workflow.

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/AlexandreFigueired0/Fluxion/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AlexandreFigueired0/Fluxion/discussions)

---

Made with ❤️ by [Alexandre Figueiredo](https://github.com/AlexandreFigueired0)