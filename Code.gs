/**
 * PUO CampusCare - Google Apps Script Backend
 * Student: KURALAMUTHAN A/L GUANALAN
 * Registration No.: 01BCE25F3013
 *
 * Setup:
 * 1. Create a Google Sheet.
 * 2. Create the sheets listed in DATABASE_SCHEMA.md.
 * 3. Open Extensions > Apps Script.
 * 4. Paste this Code.gs file.
 * 5. Replace SPREADSHEET_ID with your Google Sheet ID.
 * 6. Deploy as Web App.
 */

const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const REQUESTS_SHEET = 'Requests';

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  if (action === 'getRequestStatus') {
    return jsonResponse(getRequestStatus(e.parameter.requestId));
  }

  if (action === 'test') {
    return jsonResponse({
      success: true,
      message: 'PUO CampusCare Apps Script backend is running.'
    });
  }

  return jsonResponse({
    success: true,
    message: 'PUO CampusCare API. Use POST action submitRequest or GET action getRequestStatus.'
  });
}

function doPost(e) {
  try {
    const data = parseRequestData(e);
    const action = data.action || 'submitRequest';

    if (action === 'submitRequest') {
      return jsonResponse(submitRequest(data));
    }

    if (action === 'getRequestStatus') {
      return jsonResponse(getRequestStatus(data.requestId));
    }

    return jsonResponse({ success: false, message: 'Invalid action.' });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  }
}

function parseRequestData(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('No form data received.');
  }

  const content = e.postData.contents;

  try {
    return JSON.parse(content);
  } catch (error) {
    const params = {};
    content.split('&').forEach(function(pair) {
      const item = pair.split('=');
      params[decodeURIComponent(item[0])] = decodeURIComponent(item[1] || '').replace(/\+/g, ' ');
    });
    return params;
  }
}

function getSpreadsheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Please set SPREADSHEET_ID in Code.gs.');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getRequestsSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(REQUESTS_SHEET);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(REQUESTS_SHEET);
    sheet.appendRow([
      'RequestID',
      'Timestamp',
      'StudentName',
      'RegistrationNo',
      'PhoneNumber',
      'ServiceCategory',
      'ServiceDetails',
      'Quantity',
      'AppointmentDate',
      'ContactMethod',
      'Priority',
      'Status',
      'AssignedStaff',
      'Remarks'
    ]);
  }

  return sheet;
}

function submitRequest(data) {
  validateRequest(data);

  const sheet = getRequestsSheet();
  const requestId = generateRequestId(sheet);
  const timestamp = new Date();
  const priority = data.priority || calculatePriority(data.serviceCategory);
  const status = 'Pending';
  const assignedStaff = assignStaff(data.serviceCategory);

  sheet.appendRow([
    requestId,
    timestamp,
    data.studentName,
    data.registrationNo,
    data.phoneNumber,
    data.serviceCategory,
    data.serviceDetails,
    data.quantity || 1,
    data.appointmentDate,
    data.contactMethod,
    priority,
    status,
    assignedStaff,
    'Request submitted successfully'
  ]);

  addActivityLog(requestId, data.studentName, 'Submit Request', status);

  return {
    success: true,
    requestId: requestId,
    status: status,
    assignedStaff: assignedStaff,
    message: 'Request submitted successfully.'
  };
}

function validateRequest(data) {
  const requiredFields = [
    'studentName',
    'registrationNo',
    'phoneNumber',
    'serviceCategory',
    'serviceDetails',
    'appointmentDate',
    'contactMethod'
  ];

  requiredFields.forEach(function(field) {
    if (!data[field]) {
      throw new Error(field + ' is required.');
    }
  });
}

function generateRequestId(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return 'SRQ001';
  }

  const lastRequestId = sheet.getRange(lastRow, 1).getValue();
  const number = parseInt(String(lastRequestId).replace('SRQ', ''), 10) || 0;
  return 'SRQ' + String(number + 1).padStart(3, '0');
}

function calculatePriority(category) {
  const urgentCategories = ['IT Support', 'Facility'];
  return urgentCategories.indexOf(category) !== -1 ? 'Urgent' : 'Normal';
}

function assignStaff(category) {
  const staffMap = {
    'IT Support': 'IT Staff',
    'Facility': 'Facility Officer',
    'Document': 'Admin Office',
    'Counselling': 'Counsellor',
    'Lost & Found': 'Student Affairs',
    'General': 'General Admin'
  };

  return staffMap[category] || 'General Admin';
}

function getRequestStatus(requestId) {
  if (!requestId) {
    return { success: false, message: 'RequestID is required.' };
  }

  const sheet = getRequestsSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(requestId).toUpperCase()) {
      return {
        success: true,
        requestId: values[i][0],
        studentName: values[i][2],
        registrationNo: values[i][3],
        serviceCategory: values[i][5],
        priority: values[i][10],
        status: values[i][11],
        assignedStaff: values[i][12],
        remarks: values[i][13]
      };
    }
  }

  return { success: false, message: 'Request not found.' };
}

function updateRequestStatus(requestId, newStatus, remarks) {
  const sheet = getRequestsSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).toUpperCase() === String(requestId).toUpperCase()) {
      sheet.getRange(i + 1, 12).setValue(newStatus);
      sheet.getRange(i + 1, 14).setValue(remarks || 'Status updated');
      addActivityLog(requestId, values[i][2], 'Update Status', newStatus);
      return { success: true, message: 'Request updated successfully.' };
    }
  }

  return { success: false, message: 'Request not found.' };
}

function addActivityLog(requestId, studentName, action, status) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName('ActivityLog');

  if (!sheet) {
    sheet = spreadsheet.insertSheet('ActivityLog');
    sheet.appendRow(['Timestamp', 'RequestID', 'StudentName', 'Action', 'Status']);
  }

  sheet.appendRow([new Date(), requestId, studentName, action, status]);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
