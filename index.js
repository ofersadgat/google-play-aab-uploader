const { google } = require('googleapis');
const uploadBundle = require('./uploadBundle');

const androidPublisher = google.androidpublisher('v3');

module.exports = async function uploadToGooglePlay({
  file,
  packageName,
  track,
  keyFile,
}) {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  // Acquire an auth client, and bind it to all future calls
  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  const { data: { id: editId } } = await androidPublisher.edits.insert({
    packageName,
  });

  const versionCode = await uploadBundle({ editId, packageName, file });

  await androidPublisher.edits.tracks.update({
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

  const res = await androidPublisher.edits.commit({
    editId,
    packageName,
  });

  console.log('Bundle succesfully uploaded 🎉🎉🎉');

  return res.data;
};
