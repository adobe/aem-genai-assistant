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
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
  const workspaceName = branchName.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
  const words = workspaceName.split(/[^a-zA-Z0-9]+/);
  return words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
}

async function getCurrentGitBranch() {
  try {
    const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
    return stdout.trim().toLowerCase();
  } catch (error) {
    throw new Error("Error fetching Git branch. Ensure you're in a Git repository.");
  }
}

async function selectWorkspace(workspaceName) {
  console.log(`Selecting workspace: ${workspaceName}...`);
  try {
    await execCommand('aio', ['app', 'use', '-w', workspaceName, '--no-service-sync', '--merge']);
    console.log(`Workspace '${workspaceName}' selected successfully.`);
  } catch (error) {
    console.error(`Failed to select workspace: ${error.message}`);
  }
}

async function createWorkspace(workspaceName) {
  console.log(`Creating new workspace: ${workspaceName}...`);
  try {
    await execCommand('aio', ['app', 'use', '-w', workspaceName, '--no-confirm-new-workspace', '--no-service-sync', '--merge']);
    console.log(`Workspace '${workspaceName}' created successfully.`);
  } catch (error) {
    console.error(`Failed to create workspace: ${error.message}`);
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
  return `https://experience-qa.adobe.com/?devMode=true&shell_source=dev&shell_ims=prod&app_workspace=${workspaceName}#/aem/generate-variations/`;
}

async function deployApp(workspaceName) {
  try {
    console.log('Deploying app...');
    await execCommand('aio', ['app', 'deploy']);
    console.log('App deployed successfully.');
    if (workspaceName) {
      console.log(`\n${getDeploymentUrl(workspaceName)}\n`);
    }
  } catch (error) {
    console.error(`Failed to deploy app: ${error.message}`);
  }
}

async function deploy() {
  try {
    const inquirer = await import('inquirer');

    const output = await execCommand('aio', ['console', 'ws', 'ls', '-j']);
    const workspaces = JSON.parse(output);

    const currentBranch = await getCurrentGitBranch();
    if (currentBranch === 'main') {
      await deployApp();
      return;
    }

    const workspaceName = convertToWorkspaceName(currentBranch);

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
  }
}

deploy();
