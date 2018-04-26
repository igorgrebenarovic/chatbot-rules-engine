var shell = require('shelljs');

// files required by Azure hosting
shell.cp('-R', 'process.json', 'dist/');
shell.cp('-R', 'package.json', 'dist/');
shell.cp('-R', 'package-lock.json', 'dist/');

// static assets
shell.cp('-R', 'src/public/', 'dist/');

// workflows 
shell.cp('-R', 'src/workflows/', 'dist/');