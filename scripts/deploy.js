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
const { spawn } = require('child_process');
const { getCurrentGitBranch } = require('./utils.js');

const WORKSPACE_PRODUCTION = 'Production';
const WORKSPACE_STAGE = 'Stage';
const WORKSPACE_QA = 'QA';
const WORKSPACE_DEVELOPMENT = 'Development';

function execCommand(command, args) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args);

    let output = '';
    let error = '';

    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    cmd.stderr.on('data', (data) => {
      error += data.toString();
    });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command exited with code ${code}: ${error}`));
      } else {
        resolve(output);
      }
    });
  });
}

function convertToWorkspaceName(branchName) {
  return branchName.replace(/[^a-zA-Z0-9]/g, '');
}

async function selectWorkspace(workspaceName) {
  console.log(`Selecting workspace: ${workspaceName}...`);
  try {
    await execCommand('aio', ['app', 'use', '-w', workspaceName, '--no-service-sync', '--merge']);
    console.log(`Workspace '${workspaceName}' selected successfully.`);
  } catch (error) {
    throw new Error(`Failed to select workspace: ${error.message}`);
  }
}

async function createWorkspace(workspaceName) {
  console.log(`Creating new workspace: ${workspaceName}...`);
  try {
    await execCommand('aio', ['app', 'use', '-w', workspaceName, '--no-confirm-new-workspace', '--no-service-sync', '--merge']);
    console.log(`Workspace '${workspaceName}' created successfully.`);
  } catch (error) {
    throw new Error(`Failed to create workspace: ${error.message}`);
  }
}

function getDeploymentUrl(workspaceName) {
  if (WORKSPACE_PRODUCTION === workspaceName) {
    return 'https://experience.adobe.com/#/aem/generate-variations/';
  } else if (WORKSPACE_STAGE === workspaceName) {
    return 'https://experience-stage.adobe.com/?shell_ims=prod#/aem/generate-variations/';
  } else if (WORKSPACE_QA === workspaceName) {
    return 'https://experience-qa.adobe.com/?shell_ims=prod#/aem/generate-variations/';
  } else if (WORKSPACE_DEVELOPMENT === workspaceName) {
    return 'https://experience-qa.adobe.com/?devMode=true&shell_source=dev&shell_ims=prod#/aem/generate-variations/';
  }
  // We use the QA environment to direct traffic to the appropriate workspace because:
  // - It is maintained by CI/CD, ensuring it is always available and current.
  // - It is not used by other developers for manual deployment of their changes.
  return `https://experience-qa.adobe.com/?devMode=true&shell_source=workspace&workspace=${workspaceName}&shell_ims=prod#/aem/generate-variations/`;
}

async function deployApp(workspaceName) {
  try {
    console.log('Deploying application...');
    await execCommand('aio', ['app', 'deploy']);
    console.log('Application deployed successfully.');
    if (workspaceName) {
      console.log('To you your deployment, visit:');
      console.log(`-> ${getDeploymentUrl(workspaceName)}`);
    }
  } catch (error) {
    throw new Error(`Failed to deploy application: ${error.message}`);
  }
}

async function deploy() {
  try {
    const currentBranch = await getCurrentGitBranch();
    console.log(`Current Git branch: ${currentBranch}`);
    if (currentBranch === 'main' || currentBranch.startsWith('/refs/tags/')) {
      // If the current branch is 'main' or a tag, deploy using settings from environment variables (CI/CD pipeline).
      await deployApp();
      return;
    }

    const output = await execCommand('aio', ['console', 'ws', 'ls', '-j']);
    const workspaces = JSON.parse(output);

    const workspaceName = convertToWorkspaceName(currentBranch);

    const inquirer = await import('inquirer');

    if (workspaces.some((ws) => ws.name === workspaceName)) {
      const matchingWorkspace = workspaces.find((ws) => ws.name === workspaceName);
      const deployToMatchingWorkspace = await inquirer.default.prompt({
        type: 'confirm',
        name: 'answer',
        message: `Would you like to deploy to the workspace matching the current Git branch (${workspaceName})?`,
        default: true,
      });
      if (deployToMatchingWorkspace.answer) {
        await selectWorkspace(matchingWorkspace.name);
        await deployApp(matchingWorkspace.name);
        return;
      }
    } else {
      const shouldCreateWorkspace = await inquirer.default.prompt({
        type: 'confirm',
        name: 'answer',
        message: `Would you like to create a new workspace for the current Git branch (${workspaceName})?`,
        default: true,
      });
      if (shouldCreateWorkspace.answer) {
        await createWorkspace(workspaceName);
        await deployApp(workspaceName);
        return;
      }
    }

    const answers = await inquirer.default.prompt({
      type: 'list',
      name: 'answer',
      message: 'Choose a workspace:',
      choices: workspaces.map((ws) => ({ name: ws.name, value: ws.name })),
    });
    await selectWorkspace(answers.answer);
    await deployApp(answers.answer);
  } catch (error) {
    console.error(`Error during execution: ${error.message}`);
    process.exit(1);
  }
}

deploy();
