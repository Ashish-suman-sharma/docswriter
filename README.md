# DocsWriter

DocsWriter is a Node.js CLI tool that automatically generates comprehensive documentation for your projects using the Gemini AI API. It analyzes your project structure, code patterns, and existing documentation to create detailed, well-structured documentation in Markdown format.

## Overview

DocsWriter analyzes your project's structure, code files, and dependencies to automatically generate comprehensive documentation using AI. It helps developers maintain up-to-date documentation with minimal effort.

## Installation

```bash
# Install globally
npm install -g docswriter

# Or use with npx without installing
npx docswriter
```

## Usage

Navigate to your project directory and run:

```bash
docswriter
```

Or with options:

```bash
docswriter --output custom-docs --exclude "node_modules,dist,build,.git"
```

## Options

- `--output`, `-o`: Specify the output directory for documentation (default: "docs")
- `--exclude`, `-e`: Patterns to exclude from analysis (comma separated, default: "node_modules,dist,build,.git")
- `--help`, `-h`: Show help
- `--version`, `-v`: Show version

## Benefits

- **Zero Configuration**: Comes with a built-in API key, no setup required
- **Instant Documentation**: Generate comprehensive docs with a single command
- **Smart Analysis**: Automatically detects project structure and dependencies
- **AI-Powered**: Uses Gemini AI to create natural, readable documentation
- **Customizable**: Multiple output options and exclusion patterns

## Requirements

- Node.js 14 or higher

That's it! DocsWriter comes with everything needed to generate documentation.

## Optional Setup

If you prefer to use your own Gemini API key:

1. Create a `.env` file in your project root with your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

2. Run the tool in your project directory

## License

ISC
