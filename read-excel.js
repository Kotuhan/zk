const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('Untitled spreadsheet.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('Sheet name:', sheetName);
  console.log('\nData:');
  console.log(XLSX.utils.sheet_to_csv(worksheet, {FS: '\t'}));
  
  console.log('\n\nJSON format:');
  const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});
  console.log(JSON.stringify(json, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}
