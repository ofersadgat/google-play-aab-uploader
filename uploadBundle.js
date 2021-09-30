const { google } = require('googleapis');

const androidPublisher = google.androidpublisher('v3');
const progress = require('progress-stream');
const fs = require('fs');
const cliProgress = require('cli-progress');
const convertToMB = require('./convertToMB');
const progressBar = require('./progressBar');

module.exports = async function uploadBundle({
  editId, packageName, file, quiet,
}) {
  const stat = fs.statSync(file);

  const str = progress({
    length: stat.size,
    time: 100, /* ms */
  });

  const bar = new cliProgress.SingleBar({}, progressBar);

  // stop the bar in case of an exit, otherwise it may break the terminal
  const stopBar = () => bar.stop();
  process.on('SIGTERM', stopBar);

  if (!quiet) {
    bar.start(convertToMB(stat.size), 0);
    str.on('progress', (streamProgress) => {
      bar.update(convertToMB(streamProgress.transferred));
    });
  }

  const stream = fs.createReadStream(file)
    .pipe(str);

  const result = await androidPublisher.edits.bundles.upload({
    editId,
    packageName,
    media: {
      mimeType: 'application/octet-stream',
      body: stream,
    },
  }).catch((err) => {
    bar.stop();
    throw err;
  });

  bar.stop();

  process.off('SIGTERM', stopBar);

  return result.data.versionCode;
};
