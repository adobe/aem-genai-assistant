const chalk = require('chalk');
const ora = require('ora');

module.exports = (config) => {
  const spinner = ora();
  const PROTECTED_WORKSPACES = ['QA', 'Production'];

  spinner.info(chalk.blue('Running pre-app-deploy hook'));

  if (config.project.workspace) {
    if (PROTECTED_WORKSPACES.includes(config.project.workspace.name) && !process.env.GITHUB_ACTIONS) {
      console.log(chalk.red(chalk.bold(`\nDeployment failed:\n  -> The target workspace '${config.project.workspace.name}' is protected and cannot be deployed to. Please switch to a different workspace and try again.\n`)));
      process.exit(1);
    }
  }
};
