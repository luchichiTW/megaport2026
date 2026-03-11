#!/bin/sh
# Compile app.jsx → app.js (JSX only)
BABEL=/tmp/babel-compile/node_modules
node -e "
const fs = require('fs');
const {transformSync} = require('$BABEL/@babel/core');
const jsx = fs.readFileSync('app.jsx', 'utf8');
const {code} = transformSync(jsx, {
  presets: ['$BABEL/@babel/preset-react']
});
fs.writeFileSync('app.js', code);
console.log('app.js:', code.length, 'bytes');
"
