import fs from 'fs';


const csvFilePath = './info.csv'

const jsonData = [];
fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  
  const lines = data.trim().split('\n');
  console.log(lines)
  const headers = lines.shift().trim().split(',');

 

  lines.forEach(line => {
    const values = line.trim().split(',');

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    jsonData.push(row);
  });
  console.log(jsonData);

});


export default  jsonData 
