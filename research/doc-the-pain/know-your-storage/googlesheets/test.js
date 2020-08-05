#!/usr/bin/env node
/*
 * this script uses the `googleapis` library to authenticate and fetch
 * values from a spreadsheet.
 * before running this script, follow the instructions in Part A of
 * README.md to set up a service account for use with this script.
 * the script also `require`s the `googleapis` library which is not
 * bundled with the application. since this is a test script, install
 * the library manually.
 * the script runs silently by default. to see the DEBUG output, set
 * the `DEBUG` environment variable
 */

const { google } = require('googleapis');

async function authenticate() {
	const auth = new google.auth.GoogleAuth({
		keyFile: '/path/to/service-account-keyfile.json',
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	});
	const authToken = await auth.getClient();
	if (process.env.DEBUG) { console.debug(authToken) }
	return authToken;
}

const sheets = google.sheets('v4');
const spreadsheetId = 'spreadsheetId';
const sheetName = 'Sheet1';

async function fetchSpreadsheet() {
	const auth = await authenticate();
	const spreadsheet = await sheets.spreadsheets.get({
		spreadsheetId,
		auth,
	});
	if (process.env.DEBUG) { console.debug(spreadsheet.data) }
}

async function fetchSpreadsheetValues() {
	const auth = await authenticate();
	const spreadsheetValues = await sheets.spreadsheets.values.get({
		spreadsheetId,
		auth,
		range: sheetName,
	});
	if (process.env.DEBUG) { console.debug(spreadsheetValues.data) }
}

// fetchSpreadsheet();
// fetchSpreadsheetValues();
