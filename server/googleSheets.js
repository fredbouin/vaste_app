// server/googleSheets.js

const { google } = require('googleapis');
const path = require('path');

// Set up Google Sheets API client with service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials/google-sheets.json'),  // Path to your JSON credentials file
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Read-only access for Google Sheets
});

const sheets = google.sheets({ version: 'v4', auth });

// Function to fetch data from the Google Sheet
async function fetchData() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: 'your-google-sheet-id', // Replace with your actual Google Sheet ID
    range: 'Sheet1!A1:D10', // Modify the range to match your sheet
  });
  console.log(response.data.values); // Logs the fetched data
}

// Call the fetchData function
fetchData().catch(console.error);
