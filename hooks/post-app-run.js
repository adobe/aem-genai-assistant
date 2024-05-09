#!/usr/bin/env node
const chalk = require('chalk');
const ora = require('ora');

const APP_URL = 'https://experience-qa.adobe.com/?shell_source=local&devMode=true&shell_ims=prod#/aem/generate-variations/';

module.exports = (config) => {
  const spinner = ora();

  spinner.info(chalk.blue('Running post-app-run hook'));
  console.log(chalk.magenta(chalk.bold(`To view your locally deployed AEM Generate Variations application:\n\  -> ${APP_URL}`)));
};
