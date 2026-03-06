# Contributing Guide

Thank you for your interest in contributing to the JEP project! We welcome all forms of contributions, including but not limited to:

- Bug reports
- Feature suggestions
- Documentation improvements
- Code contributions

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Contributing Code](#contributing-code)
- [Style Guidelines](#style-guidelines)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to `signal@humanjudgment.org`.

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/[REPO-NAME].git
   cd [REPO-NAME]
   ```
3. Set up the development environment (see [Development Setup](#development-setup))
4. Create a branch for your work:
   ```bash
   git checkout -b your-feature-name
   ```

---

## Reporting Bugs

### Before Submitting a Bug Report

- Check the [Issues](https://github.com/hjs-protocol/[REPO-NAME]/issues) to see if the problem has already been reported
- Ensure you're running the latest version
- Try to isolate the problem

### How to Submit a Good Bug Report

A good bug report includes:

- **Clear title**: Briefly describe the issue
- **Steps to reproduce**: List the exact steps to trigger the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment details**:
  - OS version
  - Runtime version (Node/Python/Rust etc.)
  - Package version
- **Screenshots** or **logs** if applicable

Create a bug report by opening a new issue and using the "Bug report" template.

---

## Suggesting Features

We welcome feature suggestions! Before submitting:

1. Check if the feature has already been suggested in [Issues](https://github.com/hjs-protocol/[REPO-NAME]/issues)
2. Consider whether the feature aligns with the project's goals
3. Think about how the feature would benefit other users

When submitting a feature suggestion, please include:

- **Clear description** of the feature
- **Use case** explaining why it's needed
- **Proposed implementation** (if you have ideas)
- **Alternatives** you've considered

---

## Contributing Code

### Finding an Issue to Work On

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - We'd love assistance with these
- `bug` - Something that needs fixing
- `enhancement` - New features or improvements

Comment on the issue to let others know you're working on it.

### Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b your-feature-name
   ```

2. Make your changes, following our [style guidelines](#style-guidelines)

3. Test your changes locally:
   ```bash
   # Run appropriate test command for this repository
   ```

4. Commit your changes with a clear message:
   ```bash
   git commit -m "type: brief description of changes"
   ```
   
   Use conventional commit types:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. Push to your fork:
   ```bash
   git push origin your-feature-name
   ```

---

## Style Guidelines

### Code Style

- Follow the existing code style in the repository
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Example:
```
feat(api): add support for new feature

- Add new functionality
- Update documentation
- Add tests

Closes #123
```

---

## Development Setup

*[This section should be customized for each repository with specific setup instructions]*

### Prerequisites

- [List required software versions]

### Local Setup

1. Install dependencies:
   ```bash
   # Repository-specific install command
   ```

2. Create environment file (if applicable):
   ```bash
   cp .env.example .env
   ```

3. Edit configuration as needed

4. Run tests to verify setup:
   ```bash
   # Repository-specific test command
   ```

---

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if necessary
3. Add tests for new functionality
4. Make sure all tests pass
5. Ensure your branch is up to date with `main`:
   ```bash
   git remote add upstream https://github.com/hjs-protocol/[REPO-NAME].git
   git fetch upstream
   git rebase upstream/main
   ```
6. Push to your fork and submit a Pull Request
7. In your PR description, include:
   - What changes you made
   - Why you made them
   - Any issues resolved (use "Fixes #123" syntax)
   - Screenshots for UI changes

### Review Process

- At least one maintainer will review your PR
- Address review comments by pushing additional commits
- Once approved, a maintainer will merge your PR

---

## Community

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and community conversations
- **Email**: `signal@humanjudgment.org`

---

## Recognition

Contributors will be recognized in:
- The project's README
- Release notes

---

## Thank You!

Your contributions help make JEP better for everyone. We appreciate your time and effort!

---

**© 2026 HJS Foundation Ltd.**
