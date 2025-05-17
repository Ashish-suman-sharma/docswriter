const path = require("path");

/**
 * Analyzes the project structure based on scanned files
 * @param {Array<{path: string, content: string, extension: string}>} files - List of project files
 * @param {string} projectPath - The root path of the project
 * @returns {Promise<Object>} Project analysis object
 */
async function analyzeProject(files, projectPath) {
  console.log("Analyzing project structure...");

  const analysis = {
    projectName: path.basename(projectPath),
    projectPath,
    files: files.length,
    languages: {},
    dependencies: {},
    structure: {},
    packageInfo: null,
    readme: null,
  };

  // Count languages used in the project
  files.forEach((file) => {
    const ext = file.extension;
    if (!analysis.languages[ext]) {
      analysis.languages[ext] = 0;
    }
    analysis.languages[ext]++;

    // Build folder structure
    const parts = file.path.split(/[/\\]/);
    let current = analysis.structure;

    parts.forEach((part, index) => {
      if (!current[part]) {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = { type: "file", extension: ext };
        } else {
          // It's a directory
          current[part] = { type: "directory", children: {} };
        }
      }

      if (index < parts.length - 1) {
        current = current[part].children;
      }
    });
  });

  // Extract package.json information
  const packageFile = files.find(
    (file) => file.path.toLowerCase() === "package.json"
  );
  if (packageFile) {
    try {
      analysis.packageInfo = JSON.parse(packageFile.content);

      // Extract dependencies
      const allDeps = {
        ...analysis.packageInfo.dependencies,
        ...analysis.packageInfo.devDependencies,
      };

      analysis.dependencies = allDeps;
    } catch (error) {
      console.warn("Failed to parse package.json:", error.message);
    }
  }

  // Extract README content
  const readmeFile = files.find(
    (file) =>
      file.path.toLowerCase() === "readme.md" ||
      file.path.toLowerCase() === "readme"
  );

  if (readmeFile) {
    analysis.readme = readmeFile.content;
  }

  return analysis;
}

module.exports = {
  analyzeProject,
};
