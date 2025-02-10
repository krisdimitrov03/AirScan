const path = require('path');
const fs = require('fs');

const loadJsonData = (fileName) => {
    const filePath = path.join(__dirname, '../seed', fileName);
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Error reading JSON file: ${filePath}`, error);
        return [];
    }
};

module.exports = loadJsonData;