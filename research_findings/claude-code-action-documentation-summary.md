# Claude Code GitHub Action: Configuration and Settings Summary

**Research Date:** November 14, 2024
**Researcher:** Claude
**Sources:**
- [FAQ Documentation](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md)
- [Capabilities and Limitations](https://github.com/anthropics/claude-code-action/blob/main/docs/capabilities-and-limitations.md)
- [Setup Guide](https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md)

---

## Table of Contents
1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Capabilities](#capabilities)
4. [Limitations](#limitations)
5. [Authentication & Security](#authentication--security)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Best Practices](#best-practices)

---

## Overview

The Claude Code GitHub Action is a GitHub integration that allows Claude AI to interact with your repositories through comments, issue assignments, and automated workflows. It can answer questions, review code, implement changes, and create pull requests.

### Key Features
- **Interactive Mode**: Responds to `@claude` mentions in comments
- **Automation Mode**: Executes tasks automatically based on workflow configuration
- **Smart Branch Handling**: Automatically manages branches based on context
- **Single Comment Updates**: All responses appear in one comment with task progress tracking

---

## Setup & Configuration

### Prerequisites
- Repository admin access
- Anthropic API key or Claude Code OAuth token

### Quick Setup Steps

1. **Install the Claude GitHub App**
   - Visit: https://github.com/apps/claude
   - Install to your repository

2. **Add API Key to Secrets**
   - Go to Repository Settings → Secrets and variables → Actions
   - Add secret named `ANTHROPIC_API_KEY` with your API key
   - Alternative: `CLAUDE_CODE_OAUTH_TOKEN` for Pro/Max users

3. **Create Workflow File**
   - Copy example from `examples/claude.yml` to `.github/workflows/`
   - Configure permissions and triggers

### Essential Workflow Permissions

```yaml
permissions:
  contents: write          # For code changes
  pull-requests: write     # For PR comments
  issues: write            # For issue comments
  id-token: write          # Required for OIDC authentication
  actions: read            # Optional: For viewing CI results
```

### Mode Detection

The action automatically detects its mode:
- **With `prompt` input**: Automation mode (executes immediately)
- **Without `prompt` input**: Interactive mode (waits for @claude mentions)

### Custom GitHub App Setup

If you need to use a custom GitHub App instead of the official Claude app:

**Option 1: Quick Setup (Recommended)**
- Download `create-app.html` from the repository
- Open in browser and follow prompts
- Automatically configures all permissions

**Option 2: Manual Setup**
- Create GitHub App with required permissions (Contents, Issues, PRs: Read & Write)
- Generate private key
- Add `APP_ID` and `APP_PRIVATE_KEY` to repository secrets
- Use `actions/create-github-app-token` in workflow

---

## Capabilities

### What Claude Can Do

#### 1. **Code Analysis & Questions**
- Analyze code and provide explanations
- Answer technical questions about the codebase
- Review existing code for issues

#### 2. **Code Reviews**
- Provide detailed code review feedback
- Identify bugs, security issues, performance problems
- Suggest improvements for readability and maintainability
- Reference specific code sections with file paths and line numbers

#### 3. **Code Implementation**
- Make simple to moderate code changes
- Create new files and modify existing ones
- Handle multi-step implementation tasks

#### 4. **Branch & Commit Management**
Smart branch handling based on context:
- **Issues**: Always creates new branch with timestamp
- **Open PRs**: Pushes directly to existing PR branch
- **Closed PRs**: Creates new branch (cannot push to closed branches)

#### 5. **Pull Request Preparation**
- Creates commits on a branch
- Provides pre-filled PR creation link
- Does NOT automatically create PRs (gives you control)

#### 6. **CI/CD Integration**
When `actions: read` permission is configured:
- Access GitHub Actions workflow runs
- View job logs and test results
- Help debug CI failures

#### 7. **Communication**
- Updates single comment with progress
- Uses checkboxes to track task completion
- Provides clear status updates throughout execution

### What Claude Cannot Do

#### 1. **GitHub Operations**
- ❌ Submit formal GitHub PR reviews
- ❌ Approve pull requests (security restriction)
- ❌ Post multiple comments (only updates initial comment)
- ❌ Modify workflow files in `.github/workflows/` (security restriction)

#### 2. **Git Operations**
- ❌ Merge branches
- ❌ Rebase branches (without explicit permission)
- ❌ Force push operations
- ❌ Push to branches other than where invoked

#### 3. **Command Execution**
- ❌ Execute arbitrary bash commands (disabled by default for security)
- ❌ Access commands outside repository context

#### 4. **Repository Access**
- ❌ Work across multiple repositories
- ❌ Push to other repositories

---

## Authentication & Security

### Authentication Methods

#### Option 1: API Key (Default)
```yaml
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

#### Option 2: OAuth Token (Pro/Max Users)
```yaml
anthropic_api_key: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```
Generate token by running `claude setup-token` locally.

#### Option 3: Custom GitHub App
```yaml
- name: Generate GitHub App token
  id: app-token
  uses: actions/create-github-app-token@v1
  with:
    app-id: ${{ secrets.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}

- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    github_token: ${{ steps.app-token.outputs.token }}
```

### Security Best Practices

#### ✅ DO:
1. Always use GitHub secrets for API keys
2. Regularly rotate API keys and tokens
3. Use environment secrets for organization-wide access
4. Be specific with tool permissions (only enable what's necessary)
5. Test in separate branch before using on important PRs
6. Review Claude's changes carefully before merging

#### ❌ DON'T:
1. Never commit API keys directly to repository
2. Never share API keys in pull requests or issues
3. Avoid logging workflow variables that might contain keys
4. Don't use hardcoded credentials

### Permission Control

Only users with **write permissions** to the repository can trigger Claude. This prevents unauthorized use.

---

## Common Issues & Solutions

### Triggering & Authentication

#### Issue: @claude doesn't trigger from automated workflows
**Cause:** `github-actions` user cannot trigger subsequent workflows
**Solution:** Use Personal Access Token (PAT) instead of `GITHUB_TOKEN`

#### Issue: "Permission denied" when triggering
**Cause:** User lacks write access to repository
**Solution:** Ensure user has at least write permissions

#### Issue: Can't assign @claude to issues
**Cause:** Private org repositories can only assign to org users
**Solution:** Create custom user for private org repositories

#### Issue: OIDC authentication errors
**Cause:** Missing `id-token: write` permission
**Solution:** Add to workflow:
```yaml
permissions:
  id-token: write
```

#### Issue: 403 Resource not accessible by integration
**Cause:** GitHub App token cannot access `/user` endpoint
**Solution:** Use `bot_id` and `bot_name` inputs (have sensible defaults)

### Configuration Issues

#### Issue: Claude won't update workflow files
**Cause:** Security restriction - GitHub App lacks workflow write access
**Solution:** Manual workflow updates required (may be reconsidered in future)

#### Issue: Claude won't rebase branch
**Cause:** Disabled by default for safety
**Solution:** Enable via `claude_args` (use with caution):
```yaml
claude_args: |
  --allowedTools "Bash(git rebase:*)"
```

#### Issue: Claude doesn't create pull request
**Cause:** Not default behavior
**Solution:** This is intentional - Claude provides pre-filled PR link for user control

#### Issue: Can't see GitHub Actions CI results
**Cause:** Missing permissions
**Solution:** Add to workflow:
```yaml
permissions:
  actions: read

# In action configuration:
additional_permissions: |
  actions: read
```

#### Issue: Claude only updates one comment
**Cause:** This is intentional design
**Solution:** Not an issue - prevents cluttering discussions

### Branch & Commit Issues

#### Issue: Shallow clone missing history
**Cause:** Performance optimization (PRs: depth=20, new branches: depth=1)
**Solution:** Configure in checkout step:
```yaml
- uses: actions/checkout@v5
  with:
    depth: 0  # Full history
```

#### Issue: New branch created on closed PR comment
**Cause:** Cannot push to closed PR branches
**Solution:** This is expected behavior

### Tool & Command Issues

#### Issue: Bash commands don't execute
**Cause:** Disabled by default for security
**Solution:** Enable specific commands:
```yaml
claude_args: |
  --allowedTools "Bash(npm:*),Bash(git:*)"
```

#### Issue: Variations like @claude-bot don't work
**Cause:** Trigger uses word boundaries
**Solution:** Use exact `@claude` or customize `trigger_phrase`

#### Issue: Comments not posted as claude[bot]
**Cause:** Using custom `github_token`
**Solution:** Remove `github_token` unless using custom GitHub App
**Note:** `use_sticky_comment` only works with claude[bot] authentication

### Environment Issues

#### Issue: Need custom executables (Nix, Docker, etc.)
**Solution:** Specify custom paths:
```yaml
path_to_claude_code_executable: "/path/to/custom/claude"
path_to_bun_executable: "/path/to/custom/bun"
```

---

## Best Practices

### Workflow Configuration

1. **Always specify permissions explicitly**
   ```yaml
   permissions:
     contents: write
     pull-requests: write
     issues: write
     id-token: write
   ```

2. **Use minimal tool permissions**
   ```yaml
   claude_args: |
     --allowedTools "Bash(npm:*),Bash(git:*)"  # Only what's needed
   ```

3. **Start with automation for repetitive tasks**
   ```yaml
   prompt: "Review this PR for security vulnerabilities"
   ```

### Security

1. Use GitHub secrets for all sensitive values
2. Regularly rotate API keys and tokens
3. Review Claude's changes before merging
4. Monitor token usage to avoid API limits
5. Use short-lived tokens when possible

### Development Workflow

1. Test in separate branch before production use
2. Be specific with Claude's instructions
3. Use checkboxes to track progress
4. Review CI/CD integration carefully
5. Keep workflow files up to date

### MCP Servers

Two MCP servers are available by default:
- **GitHub MCP server**: For GitHub API operations
- **File operations server**: For advanced file manipulation

Tools from these servers must still be explicitly allowed via `claude_args` with `--allowedTools`.

---

## Migration Notes

### Deprecated in v1.0

**Old (v0.x):**
```yaml
direct_prompt: "Review this PR"
custom_instructions: "Focus on security"
```

**New (v1.0):**
```yaml
prompt: "Review this PR"
claude_args: |
  --system-prompt "Focus on security"
```

---

## Getting Help

### Resources
1. [GitHub Issues](https://github.com/anthropics/claude-code-action/issues)
2. [Example Workflows](https://github.com/anthropics/claude-code-action#examples)
3. [FAQ Documentation](https://github.com/anthropics/claude-code-action/blob/main/docs/faq.md)
4. [Permissions Documentation](https://docs.anthropic.com/en/docs/claude-code/settings#permissions)

### Troubleshooting Steps
1. Check GitHub Action logs for execution trace
2. Verify permissions in workflow file
3. Confirm API key is correctly set in secrets
4. Review trigger phrase formatting
5. Check user has write access to repository

---

## Summary

The Claude Code GitHub Action is a powerful tool for integrating AI assistance into your development workflow. Key takeaways:

- **Setup is straightforward**: Install app, add API key, create workflow
- **Two modes**: Interactive (@claude mentions) and automation (prompt-based)
- **Security-focused**: Explicit permissions, no workflow modifications, controlled tool access
- **Smart branch handling**: Adapts behavior based on context
- **User control**: Provides PR links instead of auto-creating, updates single comment
- **Extensible**: Custom GitHub Apps, tool permissions, and executables supported

By following the configuration guidelines and best practices outlined above, you can effectively integrate Claude into your repository workflows while maintaining security and control over the development process.
