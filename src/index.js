#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

// Load environment variables from .env file, silently
try {
  const dotenvPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath });
  } else {
    // Try to find .env in parent directory
    const parentDotenvPath = path.resolve(process.cwd(), "..", ".env");
    if (fs.existsSync(parentDotenvPath)) {
      require("dotenv").config({ path: parentDotenvPath });
    } else {
      require("dotenv").config();
    }
  }
} catch (error) {
  require("dotenv").config();
}

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { scanProject } = require("./utils/fileScanner");
const { analyzeProject } = require("./analyzers/projectAnalyzer");
const { generateDocumentation } = require("./generators/docGenerator");
const { generateApiDocs } = require("./generators/apiDocGenerator");

async function main() {
  try {
    const argv = yargs(hideBin(process.argv))
      .usage("Usage: $0 [options]")
      .option("output", {
        alias: "o",
        description: "Output directory for documentation",
        type: "string",
        default: "docs",
      })
      .option("exclude", {
        alias: "e",
        description: "Patterns to exclude (comma separated)",
        type: "string",
        default: "node_modules,dist,build,.git",
      })
      .option("api-only", {
        description: "Generate only API documentation",
        type: "boolean",
        default: false,
      })
      .option("format", {
        alias: "f",
        description: "Format to generate documentation in (markdown, html)",
        type: "string",
        default: "markdown",
        choices: ["markdown", "html"],
      })
      .help()
      .alias("help", "h")
      .version()
      .alias("version", "v").argv;

    console.log("📝 DocsWriter - Automated Documentation Generator");
    console.log("Scanning project...");

    // Get the current working directory
    const projectPath = process.cwd();

    // Scan the project files
    const excludePatterns = argv.exclude.split(",");
    const files = await scanProject(projectPath, excludePatterns);

    console.log(`Found ${files.length} files to analyze.`);

    // Analyze the project structure
    const projectAnalysis = await analyzeProject(files, projectPath);

    console.log("Project analysis complete.");
    console.log("Generating documentation...");
    // Create output directory
    const outputDir = path.join(projectPath, argv.output);
    await fs.ensureDir(outputDir);

    // Generate documentation based on options
    if (argv.apiOnly) {
      await generateApiDocs(projectAnalysis, outputDir);
    } else {
      // Generate full documentation
      await generateDocumentation(projectAnalysis, outputDir);
      // Also generate API docs if there are likely API endpoints
      const hasApiFiles = Object.keys(projectAnalysis.structure).some(
        (key) =>
          key.includes("routes") ||
          key.includes("controller") ||
          key.includes("api")
      );

      if (hasApiFiles) {
        await generateApiDocs(projectAnalysis, outputDir);
      }
    }

    console.log(`✅ Documentation generated successfully in ${outputDir}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
