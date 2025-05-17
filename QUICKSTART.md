# DocsWriter Quick Start Guide

This guide will help you get started with DocsWriter, an automated documentation generator that uses the Gemini AI API to create comprehensive documentation for your projects.

## Prerequisites

1. Node.js 14 or higher installed on your machine

That's it! DocsWriter comes with a built-in API key, so you don't need to worry about getting your own.

## Installation

There are two ways to use DocsWriter:

### Global Installation

```bash
npm install -g docswriter
```

### Using npx

```bash
npx docswriter
```

## No API Key Required

DocsWriter comes with a built-in API key, so you can start using it right away without any additional setup.

If you prefer to use your own API key (optional):

1. Create a `.env` file in your project root with the following content:

```
GEMINI_API_KEY=your_api_key_here
```

2. Replace `your_api_key_here` with your actual Gemini API key.

## Basic Usage

Navigate to your project directory and run:

```bash
docswriter
```

This will:

- Scan your project files
- Analyze the project structure
- Generate comprehensive documentation in the `docs` folder

## Command Line Options

DocsWriter supports several command line options:

```
Options:
  -o, --output    Output directory for documentation   [string] [default: "docs"]
  -e, --exclude   Patterns to exclude (comma separated)
                               [string] [default: "node_modules,dist,build,.git"]
  --api-only      Generate only API documentation     [boolean] [default: false]
  -f, --format    Format to generate documentation in (markdown, html)
                                       [string] [default: "markdown"]
  -h, --help      Show help                                          [boolean]
  -v, --version   Show version number                                [boolean]
```

### Examples

Generate documentation to a custom directory:

```bash
docswriter --output my-documentation
```

Exclude specific patterns:

```bash
docswriter --exclude "tests,coverage,temp"
```

Generate only API documentation:

```bash
docswriter --api-only
```

## Generated Documentation

DocsWriter generates the following files:

- `README.md`: Main documentation file
- `_SUMMARY.md`: Summary of the generated documentation
- Topic-specific documentation files
- `api-documentation.md`: API documentation (if applicable)

## Support

If you encounter any issues or have questions, please open an issue on our [GitHub repository](https://github.com/yourusername/docswriter/issues).
