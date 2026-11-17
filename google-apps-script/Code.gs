/**
 * Reçoit les réponses du formulaire de l'invitation et les ajoute
 * comme une nouvelle ligne dans l'onglet "Réponses" du Google Sheet.
 * Installation : voir README.md à la racine du dépôt.
 */
// ID du Google Sheet (la partie de son lien entre /d/ et /edit)
const SPREADSHEET_ID = '1e-7zljWdttFR_Y9_UMGeOzm1IPiBXyEfxp78PKW1npk';
const SHEET_NAME = 'Réponses';
const COLUMNS = ['Date', 'Nom', 'Prénom', 'Invités', 'Présence', 'Alya', 'Seouda', 'Message'];
const EVENTS = ['Alya', 'Seouda'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // En-têtes toujours à jour en ligne 1
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    const p = e.parameter;
    const present = p['Présence'] === 'Présent';
    const row = COLUMNS.map(col => {
      if (col === 'Date') return new Date();
      if (EVENTS.includes(col)) {
        if (p[col] === 'Non invité') return 'Non invité';
        return present && p[col] === 'Oui' ? 'Oui' : 'Non';
      }
      return p[col] || '';
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
