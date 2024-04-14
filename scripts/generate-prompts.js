/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DATA_DIR = path.join(__dirname, '../data');
const PROMPT_TEMPLATES_DIR = path.join(__dirname, '../prompt-templates');

const PROMPT_TEMPLATES_BUNDLED_FILE_NAME = 'bundled-prompt-templates';
const PROMPT_TEMPLATES_INDEX_FILE_NAME = 'prompt-index.json';

const PROMPT_TEMPLATES_INDEX_FILE = path.join(PROMPT_TEMPLATES_DIR, PROMPT_TEMPLATES_INDEX_FILE_NAME);
const PROMPT_TEMPLATES_JSON_FILE = path.join(DATA_DIR, `${PROMPT_TEMPLATES_BUNDLED_FILE_NAME}.json`);

const readPromptIndex = () => {
  console.log(`\t* Reading Prompt Index File @ ${PROMPT_TEMPLATES_INDEX_FILE}`);
  const promptIndex = fs.readFileSync(PROMPT_TEMPLATES_INDEX_FILE, 'utf8');
  return JSON.parse(promptIndex);
};

const writePromptIndex = (promptIndex, filePath) => {
  fs.writeFileSync(PROMPT_TEMPLATES_INDEX_FILE, JSON.stringify(promptIndex, null, 4));
};

const sortPromptIndex = (promptIndex) => {
  return promptIndex.sort((a, b) => a.label.localeCompare(b.label));
};

const saveBundledPromptTemplates = (bundledPromptTemplates) => {
  console.log('\t* Writing the Bundled Prompt Templates');
  fs.writeFileSync(PROMPT_TEMPLATES_JSON_FILE, JSON.stringify(bundledPromptTemplates, null, 4));
};

const getGitBranchName = async () => {
  return new Promise((resolve) => {
    exec('git branch --show-current', (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${err}`);
        return 'main';
      }
      const branchName = stdout.replace(/(\r\n|\n|\r)/gm, '').trim() || 'main';
      console.log(`Using branch to replace GIT_BRANCH: ${branchName}`);
      resolve(branchName);
    });
  });
};

const startProgram = async () => {
  console.log('- Prompt Generator Starting...');
  try {
    // Read the prompt templates index file
    const promptIndex = readPromptIndex();
    const sortedPromptIndex = sortPromptIndex(promptIndex);
    writePromptIndex(sortedPromptIndex);

    // Create or update the bundled prompt templates file
    console.log(`\t* Creating Bundled Prompt Templates File @ ${PROMPT_TEMPLATES_JSON_FILE}`);
    const bundledPromptTemplates = [];

    // Add the prompt templates to the target files
    for await (const prompt of promptIndex) {
      const {
        label, description, file, modes,
      } = prompt;
      console.log(`\t\t* Adding ${label}`);

      // Try to read the prompt template file
      // If it fails, log the error and continue
      try {
        const promptTemplate = fs.readFileSync(path.join(PROMPT_TEMPLATES_DIR, file), 'utf8');
        const branchName = await getGitBranchName();
        const template = promptTemplate.replace(/GIT_BRANCH/g, branchName);

        // Add the prompt to the bundled prompt templates file
        bundledPromptTemplates.push({
          label, description, template, modes,
        });
      } catch (err) {
        console.log(`\t\t\t! Error: ${err}`);
        console.log(`\t\t\t! Skipping ${label}`);
      }
    }

    // Write the prompt templates to the target files
    saveBundledPromptTemplates(bundledPromptTemplates);
  } catch (error) {
    console.error('Unexpected error encountered:', error);
  }
  console.log('- Prompt Generator Complete!');
};

// Start the program
startProgram();
