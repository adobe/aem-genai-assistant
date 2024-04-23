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
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getCurrentGitBranch() {
  try {
    const ref = process.env.GITHUB_REF;
    if (ref) {
      console.debug('Fetching Git branch from environment variables...');
      const headRef = process.env.GITHUB_HEAD_REF;
      if (headRef) {
        console.debug('Using head ref from environment variables...');
        return headRef.trim().toLowerCase();
      }
      console.debug('Using ref from environment variables...');
      return ref.replace('refs/heads/', '').trim().toLowerCase();
    }
    console.debug('Fetching Git branch using Git command...');
    const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
    return stdout.trim().toLowerCase();
  } catch (error) {
    throw new Error("Error fetching Git branch. Ensure you're in a Git repository.");
  }
}

module.exports = {
  getCurrentGitBranch,
};
