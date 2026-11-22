/**
 * Reçoit les réponses du formulaire de l'invitation, les ajoute
 * comme une nouvelle ligne dans l'onglet "Réponses" du Google Sheet,
 * et envoie un e-mail de notification à chaque réponse.
 * Installation : voir README.md à la racine du dépôt.
 */
// ID du Google Sheet (la partie de son lien entre /d/ et /edit)
const SPREADSHEET_ID = '1e-7zljWdttFR_Y9_UMGeOzm1IPiBXyEfxp78PKW1npk';
const SHEET_NAME = 'Réponses';
const COLUMNS = ['Date', 'Nom', 'Prénom', 'Invités', 'Présence', 'Alya', 'Seouda', 'Message'];
const EVENTS = ['Alya', 'Seouda'];

// Destinataire(s) des notifications (plusieurs adresses : séparer par des virgules)
const NOTIFY_EMAIL = 'simydeborahsellem@gmail.com';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let row = null;
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // En-têtes toujours à jour en ligne 1
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    const p = e.parameter;
    const present = p['Présence'] === 'Présent';
    row = COLUMNS.map(col => {
      if (col === 'Date') return new Date();
      if (EVENTS.includes(col)) {
        if (p[col] === 'Non invité') return 'Non invité';
        return present && p[col] === 'Oui' ? 'Oui' : 'Non';
      }
      return p[col] || '';
    });
    sheet.appendRow(row);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }

  // La notification ne doit jamais empêcher l'enregistrement de la réponse
  try { sendNotification(row); } catch (err) { console.error('Notification : ' + err); }

  return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotification(row) {
  if (!NOTIFY_EMAIL || !row) return;
  const r = {};
  COLUMNS.forEach((col, i) => r[col] = row[i]);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const mark = v => v === 'Oui' ? '✅ Oui' : (v === 'Non invité' ? '— Non invité' : '❌ Non');
  const absent = r['Présence'] !== 'Présent';
  const fullName = (r['Nom'] + ' ' + r['Prénom']).trim();

  const subject = absent
    ? `❌ ${fullName} ne pourra pas venir`
    : `🎉 Nouvelle réponse : ${fullName} (${r['Invités']} pers.)`;

  const line = (label, value) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#8a8ea3;">${label}</td><td style="padding:6px 0;color:#3e4775;"><b>${value}</b></td></tr>`;

  let html = `<div style="font-family:Georgia,serif;max-width:480px;">
    <h2 style="color:#c9a84c;font-weight:normal;margin:0 0 12px;">Nouvelle réponse à l'invitation</h2>
    <table style="font-size:15px;border-collapse:collapse;">
      ${line('Nom', esc(fullName))}
      ${line('Présence', absent ? '❌ Absent' : '✅ Présent')}`;
  if (!absent) {
    html += line('Personnes', esc(r['Invités']))
          + line('Alya à la Torah', mark(r['Alya']))
          + line('Bar Mitzvah Party', mark(r['Seouda']));
  }
  if (r['Message']) html += line('Message', esc(r['Message']).replace(/\n/g, '<br>'));
  html += `</table>
    <p style="margin-top:18px;"><a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit" style="color:#1f5f78;">Voir toutes les réponses dans le Google Sheet</a></p>
  </div>`;

  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, htmlBody: html, name: 'Invitation Noam Moshe' });
}

// À lancer une fois depuis l'éditeur (bouton « Exécuter ») pour autoriser l'envoi d'e-mails
// et vérifier que la notification arrive bien.
function testNotification() {
  sendNotification([new Date(), 'TEST', 'Notification', '2', 'Présent', 'Oui', 'Non invité', 'Ceci est un e-mail de test.']);
}
