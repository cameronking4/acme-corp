# Claude AI Assistant Capabilities Summary

**Generated on**: November 14, 2025
**Repository**: cameronking4/acme-corp
**Branch**: claude/issue-29-20251114-0210

---

## Overview

I am Claude, an AI assistant powered by Anthropic's Claude Sonnet 4.5 model, designed to help with GitHub issues and pull requests. I operate as a GitHub App that can analyze code, implement changes, and interact with your repository autonomously.

## What I Can See

### Repository Access
- **Full codebase access**: I can read any file in your repository
- **Git information**: Current branch, commit history, git status, diffs
- **Project structure**: Directory layout, file organization, dependencies
- **Configuration files**: package.json, tsconfig.json, tailwind.config.ts, etc.

### Your Project (acme-corp)
I can see that your project is:
- A **Next.js 15 application** with App Router
- Using **GitHub OAuth authentication** via NextAuth.js
- Built with **TypeScript** and **Tailwind CSS**
- Leveraging **shadcn/ui** component library
- Contains 70+ files including UI components, API routes, and authentication logic
- Has a dashboard, login page, and GitHub issue creator component

### What I Cannot See
- **Local development environment**: I don't see your local machine or running processes
- **Environment variables**: .env files are typically gitignored
- **Private data**: Secrets, credentials, or sensitive information not in the repo
- **Your screen**: I cannot see what's running on localhost:3000
- **Outside the repository**: Files not tracked in git

---

## Available Tools

### 1. File Operations

#### Read
- Read any file in the repository with line numbers
- Support for text, images, PDFs, and Jupyter notebooks
- Can read specific line ranges for large files

#### Write
- Create new files in the repository
- Overwrites existing files (requires reading first)
- Must use absolute paths

#### Edit
- Perform exact string replacements in files
- Must read file first before editing
- Can replace all occurrences or just one unique match
- Preserves exact indentation

#### Glob
- Fast file pattern matching (e.g., "**/*.tsx", "src/**/*.ts")
- Returns files sorted by modification time
- Works with any codebase size

#### Grep
- Powerful search tool built on ripgrep
- Full regex support
- Filter by file type or glob pattern
- Multiple output modes: content, files_with_matches, count
- Context lines before/after matches (-A, -B, -C)

### 2. Version Control (Git)

I have access to git commands via Bash:
- `git status` - Check working tree status
- `git diff` - View changes
- `git log` - View commit history
- `git add` - Stage files
- `git commit` - Commit changes with co-authorship
- `git push` - Push to remote branches
- `git rm` - Remove files

**Note**: I NEVER force push, and I always include co-authorship attribution.

### 3. Command Execution (Bash)

- Execute shell commands with timeout support (up to 10 minutes)
- Run commands in background for long-running processes
- Monitor output of background processes
- Kill background processes when needed
- Works for: npm, docker, testing, building, linting, etc.

**What I use Bash for**:
- Package management (npm install, npm run build)
- Running tests and linters
- Git operations
- Build processes
- Docker commands
- General terminal operations

**What I DON'T use Bash for** (I have specialized tools):
- Reading files (use Read tool)
- Searching files (use Grep/Glob)
- Editing files (use Edit tool)
- Writing files (use Write tool)

### 4. Web Interaction

#### WebFetch
- Fetch and analyze web content
- Converts HTML to markdown
- Can extract specific information from pages
- Follows redirects

#### WebSearch
- Search the web for current information
- Filter by domain (allow/block lists)
- Access information beyond my knowledge cutoff
- Only available in the US

### 5. Task Management

#### TodoWrite
- Create structured task lists
- Track progress with pending/in_progress/completed states
- Update tasks in real-time
- Break complex tasks into manageable subtasks
- Ensures nothing is forgotten

#### Task (Agent System)
- Launch specialized agents for complex multi-step tasks
- Types available:
  - **Explore**: Fast codebase exploration and searching
  - **Plan**: Planning and multi-step problem solving
  - **general-purpose**: Complex research and multi-step tasks

### 6. GitHub Integration

#### Comment Management
- Update my GitHub comment to show progress
- Display task checklists
- Communicate all results through comments
- Add spinners to show work in progress

#### Sequential Thinking (MCP)
- Break down complex problems step-by-step
- Revise and refine analysis
- Generate and verify hypotheses
- Adaptive problem-solving with course correction

---

## What I Can Do

### Code Analysis & Review
- Read and understand codebases of any size
- Identify bugs, security issues, and performance problems
- Suggest improvements for readability and maintainability
- Check for best practices and coding standards
- Provide specific references with file paths and line numbers

### Code Implementation
- Implement new features and functionality
- Fix bugs and resolve issues
- Refactor code for better structure
- Add tests and documentation
- Update dependencies and configurations

### Git Workflows
- Create commits with descriptive messages
- Always include co-authorship attribution
- Push changes to remote branches
- Provide PR creation links with pre-filled titles and descriptions
- Never force push or perform destructive operations

### Project Understanding
- Analyze project structure and architecture
- Understand dependencies and configurations
- Read documentation and README files
- Identify patterns and conventions
- Navigate complex codebases

### Testing & Quality
- Run test suites
- Execute linters and formatters
- Build projects
- Check for compilation errors
- Validate configurations

### Web Research
- Fetch documentation from websites
- Search for current information
- Access API documentation
- Look up error messages
- Find solutions to problems

---

## What I Cannot Do

### GitHub Limitations
- **Cannot approve pull requests**: Security restriction
- **Cannot submit formal PR reviews**: Can only comment
- **Cannot post multiple comments**: I update a single comment
- **Cannot modify workflow files**: No permissions for .github/workflows
- **Cannot merge branches**: No branch operations beyond commit/push

### Execution Limitations
- **Cannot run your local dev server**: No access to localhost
- **Cannot access your machine**: Only the repository in CI environment
- **Cannot interact with browsers**: No GUI access
- **Cannot access private credentials**: For security reasons

### Operational Constraints
- **Cannot force push**: Safety measure
- **Cannot skip git hooks**: Unless explicitly requested
- **Cannot run commands requiring interactive input**: Like `git rebase -i`
- **No access to workflow modifications**: Permission restricted

---

## How I Work

### 1. Triggered by User
- You mention `@claude` in an issue or PR comment
- I receive the context (issue, comments, files, etc.)

### 2. Analysis Phase
- Read relevant files in the repository
- Understand the request and requirements
- Check for CLAUDE.md files with repo-specific instructions
- Create a todo list to track work

### 3. Execution Phase
- Implement changes using file tools
- Run tests/builds if needed
- Update todo list as I progress
- Show progress in GitHub comment

### 4. Git Operations
- Stage changed files with `git add`
- Create commit with descriptive message
- Include co-authorship: `Co-authored-by: Your Name <email>`
- Push to branch with `git push`

### 5. Final Update
- Mark all todos complete
- Provide summary of changes
- Include PR creation link if changes were made
- Add link to job run for transparency

---

## Branch Strategy

- **On issues**: I create a new branch (like `claude/issue-29-20251114-0210`)
- **On open PRs**: I push directly to the existing PR branch
- **On closed PRs**: I create a new branch
- **Never**: Create unnecessary branches or force push

---

## Communication Style

- **Concise and technical**: Direct, objective technical information
- **No excessive praise**: Professional and factual
- **Markdown formatting**: GitHub-flavored markdown
- **Code references**: Include file paths and line numbers (e.g., `file.ts:123`)
- **Progress updates**: Via GitHub comment with checkboxes
- **No emojis**: Unless explicitly requested by user

---

## Example Capabilities Demonstration

### Tool Usage in This Task

1. **Glob** - Searched for all files in the repository
2. **Read** - Read README.md and package.json to understand the project
3. **Write** - Created this summary.md file
4. **Git operations** - Will commit and push these changes
5. **GitHub comment** - Updating progress throughout
6. **TodoWrite** - Tracking tasks in the issue comment

### Project Understanding

From analyzing your codebase, I can tell:
- You're using Next.js 15.0.3 with the App Router
- NextAuth v4.24.7 for GitHub OAuth authentication
- TypeScript 5 with strict type checking
- Tailwind CSS 3.4.1 with custom animations
- 50+ shadcn/ui Radix components for the UI
- Middleware protecting the /dashboard route
- API routes for GitHub integration (/api/github/issues, /api/github/repos)
- Theme support via next-themes with dark mode toggle

---

## Environment

- **Model**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Knowledge cutoff**: January 2025
- **Platform**: Linux (Ubuntu in GitHub Actions runner)
- **Working directory**: /home/runner/work/acme-corp/acme-corp
- **Git repository**: Yes
- **Current branch**: claude/issue-29-20251114-0210

---

## Limitations to Remember

1. I operate in a CI environment, not your local machine
2. I cannot see running applications or localhost
3. I work within a single GitHub comment
4. I need explicit approval for certain operations
5. I cannot modify GitHub workflow files
6. I follow security best practices strictly

---

## Best Practices I Follow

1. **Always read before editing**: Prevents accidental overwrites
2. **Use specialized tools**: Read instead of cat, Edit instead of sed
3. **Parallel execution**: Run independent commands simultaneously
4. **Task tracking**: Use TodoWrite for complex multi-step tasks
5. **Clear communication**: Update GitHub comment with progress
6. **Git hygiene**: Descriptive commits, co-authorship, never force push
7. **Security conscious**: No secrets, no destructive commands without confirmation
8. **Repository-aware**: Follow CLAUDE.md guidelines when present

---

## Summary

I'm a powerful AI assistant that can autonomously:
- Navigate and understand your entire codebase
- Implement features and fix bugs
- Run tests and builds
- Commit and push changes
- Provide detailed code reviews
- Research problems and solutions
- Track complex multi-step tasks

But I operate within a **secure, controlled environment** with appropriate limitations to protect your repository and workflow.

---

**Generated with Claude Code** | [Documentation](https://docs.claude.com/en/docs/claude-code) | [GitHub](https://github.com/anthropics/claude-code-action)
