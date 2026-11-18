/**
 * All documents reader: feedback to email
 * 1. Go to script.google.com, sign in with your team Google account, create a New project, paste this code.
 * 2. Deploy > New deployment > type: Web app > Execute as: Me > Who has access: Anyone > Deploy.
 * 3. Allow the permissions it asks for, then copy the Web app URL.
 * 4. Paste that URL into feedbackEndpoint in config.js.
 * Note: free Google accounts can send roughly 100 emails a day this way, which is plenty for testing.
 *
 * Feedback is delivered to the email address of the account that deploys this script
 * (Session.getActiveUser().getEmail()), so no address is hardcoded here. To change where
 * feedback goes, redeploy from a different account, or replace the TO variable below.
 */
var TO = ''; /* leave '' to send to the deploying account; or set 'you@example.com' to override */

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { d = { message: String(e.postData && e.postData.contents) }; }
  var subject = 'All documents reader: ' + (d.category || 'Feedback');
  var body = (d.message || '') +
    '\n\n---\nApp version: ' + (d.version || '') +
    '\nLanguage: ' + (d.lang || '') +
    '\nSent: ' + (d.time || '');
  var recipient = TO || Session.getActiveUser().getEmail();
  if (!recipient) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'No recipient address configured.' })).setMimeType(ContentService.MimeType.JSON);
  }
  MailApp.sendEmail(recipient, subject, body);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
