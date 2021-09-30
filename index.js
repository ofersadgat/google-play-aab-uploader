/* eslint-disable no-console */
const { google } = require('googleapis');
const uploadBundle = require('./uploadBundle');

const androidPublisher = google.androidpublisher('v3');

const checkmark = '\x1b[32m' + '✔' + '\x1b[0m';
const infoSign = '\x1b[36m' + 'i' + '\x1b[0m';

module.exports = async function uploadToGooglePlay({
  file,
  packageName,
  track,
  keyFile,
  quiet,
}) {
  const complete = (...msg) => !quiet && console.log(checkmark, ...msg);
  const info = (...msg) => !quiet && console.log(infoSign, ...msg);

  const auth = new google.auth.GoogleAuth({
    keyFile,
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  // Acquire an auth client, and bind it to all future calls
  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  info(`Starting new edit for ${packageName}`);

  const { data: { id: editId } } = await androidPublisher.edits.insert({
    packageName,
  });

  complete(`Created new edit ${editId}`);

  info('Starting aab upload');

  const versionCode = await uploadBundle({
    editId, packageName, file, quiet,
  });

  complete('Aab upload succesfull');
  info(`Assigning build ${versionCode} to track ${track}`);

  await ({
    track,
    packageName,
    editId,
    requestBody: {
      releases: [{
        versionCodes: [versionCode],
        status: 'completed',
      }],
    },
  });

  complete('Build assigned');
  info('Committing the edit');
  await androidPublisher.edits.commit({
    editId,
    packageName,
  });

  complete('Edit committed');

  info('Verifying release');
  const { data } = await androidPublisher.edits.tracks.get({ packageName, editId, track });
  const findFn = (rls) => rls.versionCodes && rls.versionCodes.includes(versionCode);
  const release = data.releases.find(findFn);

  complete(`Bundle for ${packageName} (${versionCode}) uploaded and assigned to track '${track}' release '${release.name}' 🎉`);
};
