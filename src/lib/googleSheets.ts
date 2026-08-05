import { getAccessToken, googleSignIn } from './googleAuth';

export const exportToGoogleSheets = async (data: any[], headers: string[], title: string = "Exported Data") => {
  let token = await getAccessToken();
  if (!token) {
    const result = await googleSignIn();
    if (result) {
      token = result.accessToken;
    } else {
      throw new Error('Authentication failed');
    }
  }

  // Create a new spreadsheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });

  if (!createResponse.ok) {
    throw new Error('Failed to create spreadsheet');
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const sheetName = spreadsheet.sheets[0].properties.title;

  // Format data for sheets
  const values = [
    headers,
    ...data
  ];

  // Append data to the created spreadsheet
  const appendResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: values
    })
  });

  if (!appendResponse.ok) {
    throw new Error('Failed to append data to spreadsheet');
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
};
