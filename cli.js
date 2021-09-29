#!/usr/bin/env node

const { program } = require('commander');
const uploadToGooglePlay = require('./index');

program
  .description('A program for uploading AAB builds to Google Play')
  .requiredOption('-p, --package-name <name>', 'Package name e.g. com.example.app')
  .requiredOption('-f, --file <location>', 'Location of the AAB file')
  .option('-t, --track <name>', 'To which track should we upload the build', 'internal')
  .option('-k, --key-file <name>', 'Location of the auth key file');

program.parse();

const options = program.opts();

uploadToGooglePlay(options)
  .then(console.log)
  .catch(console.error);
