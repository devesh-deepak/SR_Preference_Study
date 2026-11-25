/**
 * Receiver for the super-resolution preference study (static page on GitHub Pages).
 *
 * Paste into the Apps Script editor of a Google Sheet (Extensions → Apps Script), then
 * Deploy → New deployment → Web app, "Execute as: Me", "Who has access: Anyone", and put the /exec URL in
 * config.js. Each POST appends one row; a participant's page sends its whole record so far every 13 answers
 * and at the end, so one session gives several rows and the analysis keeps the longest record per session.
 * Nobody can read the sheet through this endpoint: it only appends.
 */
const SHEET_NAME = 'responses';
const MAX_CHARS = 45000;             // a Sheets cell holds 50,000 characters; a full record is about 12,000

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = (e && e.postData && e.postData.contents) || '';
    if (body.length > MAX_CHARS) return reply({ ok: false, error: 'record too large' });
    const rec = JSON.parse(body);
    if (rec.schema !== 'sr-pref-2' || !Array.isArray(rec.answers)) return reply({ ok: false, error: 'unexpected record' });
    const clean = (v, pattern, n) => String(v === undefined || v === null ? '' : v).replace(pattern, '').slice(0, n);
    sheet().appendRow([
      new Date(),
      clean(rec.pid, /[^A-Za-z0-9-]/g, 64),
      clean(rec.seed, /[^0-9]/g, 12),
      clean(rec.started_at, /[^0-9TZ:.\-]/g, 40),
      rec.finished === true,
      rec.test === true,
      rec.answers.length,
      body,                           // starts with "{", so Sheets keeps it as text, never as a formula
    ]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return reply({ ok: true, service: 'sr-preference-study' });
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['received', 'pid', 'seed', 'started_at', 'finished', 'test', 'n_answers', 'record']);
  }
  return sh;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
