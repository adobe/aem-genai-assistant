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
const Excel = require('exceljs');

const EXAMPLES_DIR = path.join(__dirname, '../examples');
const PROMPT_TEMPLATES_EXAMPLE_FILE_NAME = 'prompt-templates';
const PROMPT_TEMPLATES_EXCEL_FILE = path.join(EXAMPLES_DIR, `${PROMPT_TEMPLATES_EXAMPLE_FILE_NAME}.xlsx`);

const startProgram = async () => {
  console.log('- Zipping Examples Starting...');
  try {
    // Create the prompt templates target files if they don't exist
    if (!fs.existsSync(PROMPT_TEMPLATES_EXCEL_FILE)) {
      console.log(`\t* Creating Excel File @ ${PROMPT_TEMPLATES_EXCEL_FILE}`);
      createExcelFile();
      convertExcelToCsv();
    } else {
      console.log(`\t* Excel File Exists @ ${PROMPT_TEMPLATES_EXCEL_FILE}`);
    }

    // TODO: Create the target audiences file

    // Zip the example directory
    await zipExampleDirectory();
  } catch (error) {
    console.error("Unexpected error encountered:", error);
  }
  console.log('- Zipping Examples Complete!');
};

const createExcelFile = () => {
  console.log(`\t* Creating Excel File @ ${PROMPT_TEMPLATES_EXCEL_FILE}`);
  workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Prompt Templates');
  worksheet.columns = [
    { header: 'Label', key: 'label' },
    { header: 'Description', key: 'description' },
    { header: 'Template', key: 'template' },
  ];

  // Format the header row
  worksheet.getRow(1).font = { bold: true };

  // Format all cells to wrap text
  worksheet.columns.forEach((column) => {
    column.width = 50;
    column.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
  });

  console.log('\t* Writing the Excel File')
  workbook.xlsx.writeFile(PROMPT_TEMPLATES_EXCEL_FILE);
};

const convertExcelToCsv = () => {
  console.log('\t* Converting Excel File to CSV')
  workbook.csv.writeFile(PROMPT_TEMPLATES_CSV_FILE);
};

const zipExampleDirectory = async () => {
  return new Promise((resolve, reject) => {
    console.log('- Zipping Examples Directory');
    const archiver = require('archiver');
    var output = fs.createWriteStream('examples/Templates.zip');
    var archive = archiver('zip');

    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      resolve('Zipping completed!');
    });

    archive.on('error', function (err) {
      reject(err);
    });

    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive but excluding .zip files
    archive.glob('examples/*', { ignore: ['**/*.zip'] });

    archive.finalize();
  });
};

// Start the program
startProgram();
