const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');

const DATA_DIR = path.join(__dirname, '../data');
const EXAMPLES_DIR = path.join(__dirname, '../examples');
const PROMPT_TEMPLATES_DIR = path.join(__dirname, '../prompt-templates');

const PROMPT_TEMPLATES_BUNDLED_FILE_NAME = 'bundledPromptTemplates';
const PROMPT_TEMPLATES_EXAMPLE_FILE_NAME = 'prompt-templates';
const PROMPT_TEMPLATES_INDEX_FILE_NAME = 'prompt-index.json';

const PROMPT_TEMPLATES_INDEX_FILE = path.join(PROMPT_TEMPLATES_DIR, PROMPT_TEMPLATES_INDEX_FILE_NAME);
const PROMPT_TEMPLATES_EXCEL_FILE = path.join(EXAMPLES_DIR, `${PROMPT_TEMPLATES_EXAMPLE_FILE_NAME}.xlsx`);
const PROMPT_TEMPLATES_CSV_FILE = path.join(EXAMPLES_DIR, `${PROMPT_TEMPLATES_EXAMPLE_FILE_NAME}.csv`);
const PROMPT_TEMPLATES_JSON_FILE = path.join(DATA_DIR, `${PROMPT_TEMPLATES_BUNDLED_FILE_NAME}.json`);

let workbook = null;

const startProgram = async () => {
  console.log('- Prompt Generator Starting...');
  try {
    // Read the prompt templates index file
    const promptIndex = readPromptIndex();
    const sortedPromptIndex = sortPromptIndex(promptIndex);
    writePromptIndex(sortedPromptIndex);

    // Create the prompt templates target files
    const worksheet = createExcelFile();
    const bundledPromptTemplates = createBundledPromptTemplates(sortedPromptIndex);

    // Add the prompt templates to the target files
    promptIndex.forEach((prompt) => {
      console.log(`\t\t* Adding ${prompt.label}`)
      // Try to read the prompt template file
      // If it fails, log the error and continue
      try {
        promptTemplate = fs.readFileSync(path.join(PROMPT_TEMPLATES_DIR, prompt.file), 'utf8');
        prompt.template = promptTemplate;
        delete prompt.file;

        // Add the prompt to the Excel file
        worksheet.addRow(prompt);

        // Add the prompt to the bundled prompt templates file
        formatPromptKeys(prompt);
        bundledPromptTemplates.data.push(prompt);
      } catch (err) {
        console.log(`\t\t\t! Error: ${err}`);
        console.log(`\t\t\t! Skipping ${prompt.label}`);
        return;
      }
    });

    writePromptTemplatesToExcel(sortedPromptIndex);
    convertExcelToCsv();
    saveBundledPromptTemplates(bundledPromptTemplates);

    // Zip the example directory
    await zipExampleDirectory();
  } catch (error) {
    console.error("Unexpected error encountered:", error);
  }
  console.log('- Prompt Generator Complete!');
};

const readPromptIndex = () => {
  console.log(`\t* Reading Prompt Index File @ ${PROMPT_TEMPLATES_INDEX_FILE}`)
  const promptIndex = fs.readFileSync(PROMPT_TEMPLATES_INDEX_FILE, 'utf8');
  return JSON.parse(promptIndex);
};

const sortPromptIndex = (promptIndex) => {
  return promptIndex.sort((a, b) => a.label.localeCompare(b.label));
};

const writePromptIndex = (promptIndex, filePath) => {
  fs.writeFileSync(PROMPT_TEMPLATES_INDEX_FILE, JSON.stringify(promptIndex, null, 4));
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

  return worksheet;
};

const createBundledPromptTemplates = (promptIndex) => {
  let bundledPromptTemplates = {
    "total": 0,
    "offset": 0,
    "limit": 0,
    "data": [],
    ":type": "sheet",
  }

  bundledPromptTemplates.limit = promptIndex.length;
  bundledPromptTemplates.total = promptIndex.length;

  return bundledPromptTemplates;
};

const saveBundledPromptTemplates = (bundledPromptTemplates) => {
  console.log('\t* Writing the Bundled Prompt Templates')
  fs.writeFileSync(PROMPT_TEMPLATES_JSON_FILE, JSON.stringify(bundledPromptTemplates, null, 4));
};

const writePromptTemplatesToExcel = (sortedPromptIndex) => {
  console.log('\t* Writing the Excel File')
  workbook.xlsx.writeFile(PROMPT_TEMPLATES_EXCEL_FILE);
};

const formatPromptKeys = (prompt) => {
  Object.keys(prompt).forEach((key) => {
    newKey = key.charAt(0).toUpperCase() + key.slice(1);
    prompt[newKey] = prompt[key];
    delete prompt[key];
  });
};

const convertExcelToCsv = () => {
  console.log('\t* Converting Excel File to CSV')
  workbook.csv.writeFile(PROMPT_TEMPLATES_CSV_FILE);
};

const zipExampleDirectory = async () => {
  return new Promise((resolve, reject) => {
    console.log('- Zipping Examples Directory');
    const archiver = require('archiver');
    var output = fs.createWriteStream('examples/templates.zip');
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
