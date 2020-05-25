# Google Sheets

## Prep Work

1. Create a spreadsheet on Google sheets
2. Login to [Google Cloud Platform](https://console.developers.google.com/apis/dashboard), create a new project
3. Enable Google Sheets API
4. Create a service account
    - Go to Credentials
    - Click on Create Credentials button at the top and select Service Account
    - Enter name and description of service account and click Create button
    - Click Continue in the next dialog (no need to select role)
    - This is an important step. Click on Create Key button and choose JSON as the format and download the file. This file has the private key so be careful with it
5. Share the spreadsheet created in step 1 with service account email created in step 4
6. Write a Node.js service to access the google sheet(append, clear, get, update) using the service account credentials
7. Test the service written in step 6


## References

[1]: Google Sheets from PHP https://www.fillup.io/post/read-and-write-google-sheets-from-php/
[2]: Google Sheets from Node.js http://codingfundas.com/how-to-read-edit-google-sheets-using-node-js/index.html
[3]: Official Google Sheets API https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
