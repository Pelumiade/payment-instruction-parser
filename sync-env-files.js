const fs = require('fs');

const envFilePath = '.env';
const exampleFilePath = '.env.example';

// Function to sync env file to env.example
const syncEnvFiles = () => {
  fs.readFile(envFilePath, 'utf8', (readError, data) => {
    if (readError) {
      console.error(`Error reading ${envFilePath}:`, readError);
      return;
    }
    // Remove values from the env file content
    const envExampleContent = data
      .split('\n')
      .map((line) => line.replace(/=.*/, '='))
      .join('\n');

    fs.writeFile(exampleFilePath, envExampleContent, 'utf8', (writeError) => {
      if (writeError) {
        console.error(`Error writing ${exampleFilePath}:`, writeError);
      } else {
        console.log(`${exampleFilePath} has been updated.`);
      }
    });
  });
};

syncEnvFiles();
