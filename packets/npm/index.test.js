const fs = require('fs');
const path = require('path');
const pkg = require('./package.json');

const files_structure = [
    'index.js',
    'index.test.js',
    'package.json'
];

const node_modules_path = String(path.join(require.main.path, '..')).endsWith('node_modules')?path.join(require.main.path, '..'):path.join(path.join(path.join(require.main.path, '..'), '..'), 'node_modules');

let missing_pkg = 0, missing_file = 0;

Object.keys(pkg.dependencies || {}).forEach((dependency) => {
    const dependency_path = path.join(node_modules_path, dependency);
    if(!fs.existsSync(dependency_path)){
        console.error(`\n>> \x1b[31m${dependency}\x1b[0m is not installed! Run \x1b[36mnpm install\x1b[0m to fix the problem...\n`);
        missing_pkg++;
    }
});

files_structure.forEach((file) => {
    const file_path = path.join(__dirname, file);
    if(!fs.existsSync(file_path)){
        console.error(`\n>> \x1b[31m${file}\x1b[0m does not exist! Use \x1b[36mnpm or WHITE LOTUS\x1b[0m's Git to fix the problem...\n`);
        missing_file++;
    }
});

if(missing_pkg > 0 || missing_file > 0){
    console.log("\nAll dependencies or files are not in-place. \nPlease fix the requirements, for better understanding visit https://chsweb.vercel.app/docs\n");
    process.exit(1);
}