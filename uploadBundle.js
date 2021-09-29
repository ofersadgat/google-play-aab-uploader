const { google } = require('googleapis');

const androidPublisher = google.androidpublisher('v3');
const progress = require('progress-stream');
const fs = require('fs');
const cliProgress = require('cli-progress');
const convertToMB = require('./convertToMB');
const progressBar = require('./progressBar');

let bar;

process.on('SIGTERM', () => bar && bar.stop());

module.exports = async function uploadBundle({ editId, packageName, file }) {
  const stat = fs.statSync(file);

  const str = progress({
    length: stat.size,
    time: 100, /* ms */
  });

  bar = new cliProgress.SingleBar({}, progressBar);

  bar.start(convertToMB(stat.size), 0);

  str.on('progress', (streamProgress) => {
    bar.update(convertToMB(streamProgress.transferred));
  });

  const stream = fs.createReadStream(file)
    .pipe(str);

  const result = await androidPublisher.edits.bundles.upload({
    editId,
    packageName,
    media: {
      mimeType: 'application/octet-stream',
      body: stream,
    },
  });

  return result.data.versionCode;
};
