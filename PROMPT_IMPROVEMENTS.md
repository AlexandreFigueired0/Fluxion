# Prompt Improvement Recommendations

**Note:** These are suggestions for future implementation. Current prompts are unchanged.

---

## Current Prompts Analysis

### Generate System Prompt - What's Good ✅
- Clear guidelines about using standard actions
- Security consciousness (secrets, no hardcoding)
- Emphasizes minimal, working solutions
- Good structured output requirements
- Year awareness (2025)

### Generate System Prompt - Opportunities 💡

#### 1. **Add Specific Framework Guidance**
```
When generating workflows:

FOR GO PROJECTS:
- Use actions/setup-go@v5 (not v4 or earlier)
- Always cache Go modules: cache: true
- Use 'go-version-file: go.mod' when possible
- Run 'go mod download' before build
- Common test command: go test -v -race -coverprofile=coverage.out ./...
- For CLIs: Build with version info using ldflags

FOR NODE.JS PROJECTS:
- Use actions/setup-node@v4
- Cache: Specify cache: 'npm'/'yarn'/'pnpm' based on lockfile
- Run install before build: npm ci (not npm install)
- Common patterns: npm run lint, npm run build, npm test
- For Next.js: Build output in .next/, consider caching

FOR PYTHON PROJECTS:
- Use actions/setup-python@v5
- Cache pip with: cache: 'pip'
- Use pip install -r requirements.txt
- Consider using pip-tools or poetry
- Run tests with pytest -v --cov
```

#### 2. **Common Pitfalls Database**
```
AVOID THESE MISTAKES:

❌ Using deprecated actions:
- actions/create-release@v1 → Use softprops/action-gh-release@v1
- actions/upload-artifact@v2 → Use v4
- actions/cache@v2 → Use v4

❌ Permission issues:
- Missing 'permissions:' for GITHUB_TOKEN
- Need 'contents: write' for releases
- Need 'pull-requests: write' for PR comments

❌ Common misconfigurations:
- Forgetting to checkout code first
- Not specifying working-directory when needed
- Using 'latest' tags (use pinned versions)
- Missing required secrets documentation
```

#### 3. **Smart Defaults Based on Context**
```
CONTEXT-AWARE DEFAULTS:

If CLI application detected:
- Add release workflow template
- Include cross-platform build (matrix)
- Suggest goreleaser or similar

If web application detected:
- Add deployment step placeholders
- Suggest environment secrets
- Include build artifact upload

If tests detected:
- Add test coverage reporting
- Suggest coverage badges
- Add test result annotations

If Dockerfile detected:
- Add container build/push steps
- Suggest Docker Hub or GHCR
- Include image tagging strategy
```

#### 4. **Actionable Requirements Section**
```
When listing REQUIREMENTS, be specific:

Instead of:
"Set up GitHub secrets"

Do this:
"Configure these GitHub repository secrets:
  → Go to Settings → Secrets and variables → Actions
  → Click 'New repository secret'
  → Add: DOCKER_USERNAME (your Docker Hub username)
  → Add: DOCKER_TOKEN (create at hub.docker.com/settings/security)"
```

---

## Debug System Prompt - What's Good ✅
- Focused on root cause, fix, explanation
- Avoids over-engineering
- Concise format
- Year awareness

### Debug System Prompt - Opportunities 💡

#### 1. **Common Error Pattern Recognition**
```
RECOGNIZE THESE COMMON PATTERNS:

"Resource not accessible by integration"
→ Root cause: Insufficient permissions
→ Fix: Add permissions: section with appropriate scopes
→ Common for: releases, PR comments, package publishing

"Node.js 12 actions are deprecated"
→ Root cause: Using outdated action version
→ Fix: Update action from @v2 to @v4 or @v5
→ Look for: actions/checkout@v2, setup-python@v2, etc.

"ENOENT: no such file or directory"
→ Root cause: Working in wrong directory or file not generated
→ Fix: Check 'working-directory:' or verify previous steps
→ Common in: monorepos, projects with build outputs

"Error: Docker login failed"
→ Root cause: Invalid credentials or missing secrets
→ Fix: Verify secrets exist and are correctly referenced
→ Check: Secret names match exactly (case-sensitive)

"OpenSSL SSL_connect: SSL_ERROR_SYSCALL"
→ Root cause: Network/proxy issues or rate limiting
→ Fix: Retry mechanism or use different mirror
→ Common in: package downloads, Docker pulls

"Unable to resolve action"
→ Root cause: Action doesn't exist or wrong version
→ Fix: Verify action name and check if version tag exists
→ Check: GitHub marketplace for correct reference
```

#### 2. **Context-Aware Debugging**
```
CONSIDER PROJECT CONTEXT:

If Go project:
- Check go.mod exists and is valid
- Verify Go version in setup-go matches go.mod
- Look for missing 'go mod download' step

If Node.js project:
- Verify lockfile exists (package-lock.json)
- Check if using 'npm ci' vs 'npm install'
- Look for node_modules caching issues

If Python project:
- Check requirements.txt exists
- Verify Python version compatibility
- Look for pip cache issues
```

#### 3. **Step-by-Step Fix Format**
```
When providing FIX, use this format:

1. Locate the problem:
   Line X in .github/workflows/workflow.yml

2. Replace this:
   ```yaml
   [current broken code]
   ```

3. With this:
   ```yaml
   [fixed code]
   ```

4. Why this works:
   [Brief technical explanation]

5. Verify:
   [How to test the fix]
```

---

## Enhanced User Prompts (What Gets Sent to AI)

### Current Generate User Prompt:
```
Create a GitHub Actions workflow based on the following prompt:
[user request]
```

### Suggested Enhanced Version:
```
Create a GitHub Actions workflow for this project.

USER REQUEST:
[user request]

PROJECT CONTEXT:
[detected context from context.go]

SPECIFIC REQUIREMENTS:
- The workflow MUST use the detected build command: [command]
- The workflow MUST use the detected test command: [command]
- Use actions appropriate for [primary language]
- Follow [framework] best practices

VALIDATION:
Before outputting, ensure:
1. All action versions are pinned (v4, not v4.x)
2. Required secrets are documented in 'requirements'
3. Steps are in logical order (checkout → setup → build → test)
4. Error handling is included where appropriate

STYLE:
- Use descriptive step names
- Add inline comments for non-obvious choices
- Keep it simple but production-ready
```

### Current Debug User Prompt:
```
Debug this failed GitHub Actions workflow.
Workflow YAML:
[config]

Error Logs:
[logs]
```

### Suggested Enhanced Version:
```
Debug this failed GitHub Actions workflow.

WORKFLOW YAML:
[config]

ERROR LOGS:
[logs]

PROJECT CONTEXT:
[detected context]

ANALYSIS APPROACH:
1. Identify the specific failure step and error message
2. Check if error matches common pattern database
3. Consider project type and tech stack
4. Verify action versions and configurations
5. Check for missing dependencies or setup steps

OUTPUT FORMAT:
- Root Cause: One clear sentence about what failed
- Fix: Exact code change needed (include YAML diff)
- Explanation: Why it failed and how fix resolves it (2-3 sentences)
- Prevention: Optional tip to avoid this in future
```

---

## Prompt Testing Strategy

When you're ready to update prompts:

### A/B Testing Approach:
1. Keep original prompts as `generateSystemPromptV1`
2. Create new versions as `generateSystemPromptV2`
3. Test both with same inputs
4. Compare quality of outputs
5. Gather metrics:
   - Does generated workflow work first try?
   - How many iterations to fix?
   - User satisfaction rating

### Test Cases to Try:

**Generate Command:**
- [ ] Go CLI app
- [ ] Node.js React app
- [ ] Python Flask API
- [ ] Project with Docker
- [ ] Monorepo structure
- [ ] App with tests
- [ ] App without tests

**Debug Command:**
- [ ] Permission error
- [ ] Deprecated action
- [ ] Missing file
- [ ] Wrong directory
- [ ] Failed test
- [ ] Docker build failure
- [ ] Deployment failure

### Metrics to Track:
- **Success rate**: % of workflows that work first try
- **Token usage**: Average prompt size and response size
- **Time to fix**: How long user spends debugging
- **User satisfaction**: Did it solve their problem?

---

## Implementation Priority

When ready to enhance prompts:

### High Priority (Biggest Impact):
1. ✅ **Add framework-specific guidance** (2 hours)
   - Immediate quality improvement
   - Leverages context detection you just built

2. ✅ **Common error patterns** (1 hour)
   - Helps debug command significantly
   - Easy to implement

### Medium Priority:
3. **Better requirements formatting** (30 mins)
   - Improves UX
   - Makes output more actionable

4. **Context-aware validation** (1 hour)
   - Ensures generated workflows make sense
   - Catches obvious errors

### Low Priority (Nice to Have):
5. **Advanced patterns** (3+ hours)
   - Monorepo support
   - Matrix builds
   - Deployment strategies

---

## Example: Before & After

### Prompt Without Enhancements:
```
User: "Create a CI workflow"
AI: [Generic workflow that may or may not work]
User: [Manually fixes 3-4 issues]
Result: Works after 15 minutes
```

### Prompt With Enhancements + Context:
```
User: "Create a CI workflow"
System: [Detects Go + Cobra CLI + Tests]
AI: [Generates Go-specific workflow with correct actions]
User: [Works immediately]
Result: Works in 1 minute
```

### ROI Calculation:
- Time saved per user: ~14 minutes
- If 100 users/day: 23 hours saved daily
- User satisfaction: Much higher
- Competitive differentiation: Significant

---

## Final Thoughts

The **context detection you just implemented** is the foundation. Enhanced prompts will multiply its value:

```
Context Detection × Enhanced Prompts = 10x Better Output
```

Without context: Generic prompts can't help much
Without prompt enhancements: Context is underutilized

**Together:** You get an intelligent tool that actually understands projects and generates correct workflows.

---

## Ready to Implement?

When you want to enhance prompts:

1. Start with adding framework guidance to `generateSystemPrompt`
2. Test on your own Fluxion project
3. Verify it generates a working workflow
4. Add common errors to `debugSystemPrompt`
5. Test with real error logs
6. Iterate based on results

The foundation is solid. Prompts are the next lever to pull! 🚀
