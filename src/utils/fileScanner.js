const fs = require('fs-extra');
const path = require('path');
const globPkg = require('glob');

/**
 * Scans the project directory for relevant files
 * @param {string} projectPath - The root path of the project
 * @param {string[]} excludePatterns - Patterns to exclude from scanning
 * @returns {Promise<Array<{path: string, content: string, extension: string}>>}
 */
async function scanProject(projectPath, excludePatterns = ['node_modules', 'dist', '.git']) {
  return new Promise((resolve, reject) => {
    console.log('Scanning directory:', projectPath);
    console.log('Excluding patterns:', excludePatterns);

    // Create exclude pattern for glob
    const excludeGlob = excludePatterns.map(pattern => `**/${pattern}/**`);
    
    // Define file extensions to look for
    const extensions = '**/*.{js,ts,jsx,tsx,md,json,html,css,scss}';
    
    globPkg(extensions, {
      cwd: projectPath,
      ignore: excludeGlob,
      nodir: true,
      absolute: true
    }, async (err, files) => {
      if (err) {
        return reject(err);
      }
      
      try {
        const fileObjects = await Promise.all(files.map(async (filePath) => {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const extension = path.extname(filePath).substring(1);
            const relativePath = path.relative(projectPath, filePath);
            
            return {
              path: relativePath,
              content,
              extension
            };
          } catch (error) {
            console.warn(`Warning: Failed to read file ${filePath}:`, error.message);
            return null;
          }
        }));
        
        resolve(fileObjects.filter(Boolean));
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = {
  scanProject
};
