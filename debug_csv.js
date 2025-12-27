
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const filePath = path.join(process.cwd(), 'docs', 'medicine-recommendation-system-dataset', 'supplemental_data.csv');
const content = fs.readFileSync(filePath, 'utf-8');

try {
    const records = parse(content, { columns: true, skip_empty_lines: true });
    console.log('Success!', records.length, 'records found.');
} catch (err) {
    console.error('Error parsing CSV:');
    console.error(err.message);
    if (err.record) {
        console.error('Faulty record:', JSON.stringify(err.record));
    }
}
