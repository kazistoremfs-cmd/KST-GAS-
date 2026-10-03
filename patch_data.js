const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf8');
data = data.replace(/5: { size: 5, price: 700 },/g, '');
data = data.replace(/20: { size: 20, price: 2400 },/g, '');
fs.writeFileSync('src/data.ts', data);
