const SHEET_NAME = 'gifts';
const COLUMN_NAMES = [
  'id',
  'receiver_name',
  'message_text',
  'image_url',
  'music_url',
  'created_at',
  'avatar',
  'challenges',
  'memory_messages'
];

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0 || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, COLUMN_NAMES.length).setValues([COLUMN_NAMES]);
    return;
  }
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  COLUMN_NAMES.forEach((colName, idx) => {
    if (idx >= headers.length || !headers[idx]) {
      sheet.getRange(1, idx + 1).setValue(colName);
    }
  });
}

function getHeaderMap_(sheet) {
  ensureHeaders_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    if (h) map[String(h).trim()] = i + 1;
  });
  return map;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ status: 'error', message: 'Payload tidak ditemukan' });
    }

    let d;
    try {
      d = JSON.parse(e.postData.contents);
    } catch (_) {
      return json_({ status: 'error', message: 'JSON body tidak valid' });
    }

    // 1. Validasi id
    if (typeof d.id !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(d.id)) {
      return json_({ status: 'error', message: 'ID tidak valid (harus 8-64 karakter alfanumerik / hyphen)' });
    }

    // 2. Validasi receiver_name
    if (typeof d.receiver_name !== 'string' || d.receiver_name.trim().length === 0 || d.receiver_name.length > 50) {
      return json_({ status: 'error', message: 'Nama penerima wajib diisi (maks 50 karakter)' });
    }

    // 3. Validasi message_text
    if (typeof d.message_text !== 'string' || d.message_text.trim().length === 0 || d.message_text.length > 500) {
      return json_({ status: 'error', message: 'Pesan kado wajib diisi (maks 500 karakter)' });
    }

    // 4. Validasi image_url
    if (typeof d.image_url !== 'string' || !d.image_url.startsWith('https://i.ibb.co/')) {
      return json_({ status: 'error', message: 'Foto kado harus menggunakan tautan https://i.ibb.co/' });
    }

    // 5. Validasi music_url (opsional)
    if (d.music_url) {
      if (typeof d.music_url !== 'string') {
        return json_({ status: 'error', message: 'Format music_url tidak valid' });
      }
      const validPresets = ['preset:cozy', 'preset:happy', 'preset:romantic'];
      const isPreset = validPresets.includes(d.music_url);
      const isHttpsMp3 = d.music_url.startsWith('https://') && d.music_url.split('?')[0].toLowerCase().endsWith('.mp3');
      if (!isPreset && !isHttpsMp3) {
        return json_({ status: 'error', message: 'music_url harus berupa preset yang valid atau tautan https ke .mp3' });
      }
    }

    // 6. Validasi avatar
    const avatar = (d.avatar === 'female') ? 'female' : 'male';

    // 7. Validasi challenges
    let challengesArr = [];
    if (Array.isArray(d.challenges)) {
      if (d.challenges.length > 3) {
        return json_({ status: 'error', message: 'challenges maksimal 3 soal' });
      }
      for (let i = 0; i < d.challenges.length; i++) {
        const c = d.challenges[i];
        if (!c || typeof c !== 'object') {
          return json_({ status: 'error', message: 'Item soal kuis tidak valid' });
        }
        if (typeof c.question !== 'string' || c.question.trim().length === 0 || c.question.length > 140) {
          return json_({ status: 'error', message: 'Pertanyaan kuis harus 1-140 karakter' });
        }
        if (!Array.isArray(c.options) || c.options.length !== 4) {
          return json_({ status: 'error', message: 'Soal kuis harus memiliki tepat 4 pilihan' });
        }
        for (let j = 0; j < 4; j++) {
          const opt = c.options[j];
          if (typeof opt !== 'string' || opt.trim().length === 0 || opt.length > 60) {
            return json_({ status: 'error', message: 'Tiap pilihan kuis harus 1-60 karakter' });
          }
        }
        if (![0, 1, 2, 3].includes(c.correctIndex)) {
          return json_({ status: 'error', message: 'correctIndex harus bernilai 0, 1, 2, atau 3' });
        }
        if (!['shield', 'speed', 'power_star'].includes(c.buff)) {
          return json_({ status: 'error', message: 'buff kuis tidak valid' });
        }
        if (c.imageUrl && (typeof c.imageUrl !== 'string' || !c.imageUrl.startsWith('https://i.ibb.co/'))) {
          return json_({ status: 'error', message: 'Foto soal kuis harus dari https://i.ibb.co/' });
        }
        challengesArr.push({
          id: String(c.id || ('chal_' + (i + 1))),
          question: c.question.trim(),
          imageUrl: c.imageUrl ? c.imageUrl.trim() : undefined,
          options: c.options.map(o => String(o).trim()),
          correctIndex: c.correctIndex,
          buff: c.buff
        });
      }
    }

    // 8. Validasi memory_messages (opsional, maks 4 pesan, masing-masing maks 40 karakter)
    let memoryMessagesArr = [];
    if (Array.isArray(d.memory_messages)) {
      for (let i = 0; i < Math.min(d.memory_messages.length, 4); i++) {
        const msg = d.memory_messages[i];
        if (typeof msg === 'string' && msg.trim()) {
          memoryMessagesArr.push(msg.trim().slice(0, 40));
        } else {
          memoryMessagesArr.push('');
        }
      }
    }

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return json_({ status: 'error', message: 'Sheet ' + SHEET_NAME + ' tidak ditemukan' });
    }

    // Cek ID duplikat via createTextFinder di kolom A
    const finder = sheet.getRange('A:A').createTextFinder(d.id).matchEntireCell(true).findNext();
    if (finder && finder.getRow() > 1) {
      return json_({ status: 'error', message: 'ID sudah dipakai' });
    }

    const headerMap = getHeaderMap_(sheet);
    const targetRow = sheet.getLastRow() + 1;
    const colCount = Math.max(sheet.getLastColumn(), COLUMN_NAMES.length);

    // D5: Set format kolom baris target sebagai Plain text ('@') sebelum pengisian
    sheet.getRange(targetRow, 1, 1, colCount).setNumberFormat('@');

    const rowData = new Array(colCount).fill('');
    rowData[headerMap['id'] - 1] = String(d.id);
    rowData[headerMap['receiver_name'] - 1] = String(d.receiver_name);
    rowData[headerMap['message_text'] - 1] = String(d.message_text);
    rowData[headerMap['image_url'] - 1] = String(d.image_url || '');
    rowData[headerMap['music_url'] - 1] = String(d.music_url || '');
    rowData[headerMap['created_at'] - 1] = new Date().toISOString();
    rowData[headerMap['avatar'] - 1] = avatar;
    rowData[headerMap['challenges'] - 1] = JSON.stringify(challengesArr);
    if (headerMap['memory_messages']) {
      rowData[headerMap['memory_messages'] - 1] = JSON.stringify(memoryMessagesArr);
    }

    sheet.getRange(targetRow, 1, 1, colCount).setValues([rowData]);

    return json_({ status: 'success', id: d.id });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const id = e && e.parameter && e.parameter.id;
    if (!id) return json_({ status: 'error', message: 'Parameter id wajib' });

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ status: 'not_found', data: null });

    // D5: Cari ID dengan createTextFinder pada kolom A
    const finder = sheet.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext();
    if (!finder || finder.getRow() <= 1) {
      return json_({ status: 'not_found', data: null });
    }

    const rowNum = finder.getRow();
    const colCount = Math.max(sheet.getLastColumn(), COLUMN_NAMES.length);
    const headers = sheet.getRange(1, 1, 1, colCount).getValues()[0];
    const rowValues = sheet.getRange(rowNum, 1, 1, colCount).getValues()[0];

    const dataObj = {};
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').trim();
      if (h) dataObj[h] = rowValues[i];
    }

    let parsedChallenges = [];
    if (dataObj.challenges) {
      try {
        parsedChallenges = JSON.parse(dataObj.challenges);
        if (!Array.isArray(parsedChallenges)) parsedChallenges = [];
      } catch (_) {
        parsedChallenges = [];
      }
    }

    let parsedMemoryMessages = [];
    if (dataObj.memory_messages) {
      try {
        parsedMemoryMessages = JSON.parse(dataObj.memory_messages);
        if (!Array.isArray(parsedMemoryMessages)) parsedMemoryMessages = [];
      } catch (_) {
        parsedMemoryMessages = [];
      }
    }

    return json_({
      status: 'success',
      data: {
        id: String(dataObj.id || id),
        receiver_name: String(dataObj.receiver_name || ''),
        message_text: String(dataObj.message_text || ''),
        image_url: String(dataObj.image_url || ''),
        music_url: String(dataObj.music_url || ''),
        created_at: String(dataObj.created_at || ''),
        avatar: dataObj.avatar === 'female' ? 'female' : 'male',
        challenges: parsedChallenges,
        memory_messages: parsedMemoryMessages
      }
    });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  }
}
