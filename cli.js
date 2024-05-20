#!/usr/bin/env node

const { program } = require('commander');
const uploadToGooglePlay = require('./index');

program
  .description('A program for uploading AAB builds to Google Play')
  .requiredOption('-p, --package-name <name>', 'Package name e.g. com.example.app')
  .requiredOption('-f, --file <path>', 'Location of the AAB file')
  .option('-t, --track <name>', 'To which track should we upload the build', 'internal')
  .option('-s, --status <name>', 'What status should be used', 'completed')
  .option('-g, --graceful-exit', 'Exit gracefully if an error occurs', true)
  .option('-q, --quiet', 'Don\'t print any progress output', false)
  .option('-k, --key-file <path>', 'Location of the auth key file')
  .option('-n, --release-name <name>', 'Location of the auth key file');

program.parse();

const options = program.opts();

uploadToGooglePlay(options)
  .catch((err) => {
    if (options.gracefulExit) {
      return console.error(`❌ ${err.message}`);
    }
    throw err;
  });
