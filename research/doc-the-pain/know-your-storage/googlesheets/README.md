# Google Sheets
Google Sheets REST API is perhaps the most complex. A spreadsheet is a 
general purpose application that can be used for a wide range of use cases.
The complexity arising out of flexibility is hard to minimize and it shows!

# Prerequisites

## Part A: Create a Google Service Account
1. Create project on https://console.developers.google.com/apis/dashboard.
2. Click Enable APIs and enable the Google Sheets API
3. Go to Credentials, then click Create credentials, and select Service 
   account key
4. Choose New service account in the drop down. 
   - Give the account a name and provide a short description for reference
   - Click Create button to go the next screen
   - Role is optional - so click Continue to next step.
   - Leave grants for users access as is and click on Create Key
     - For Key Type, choose JSON (the default)
     - Download the generated JSON file and note down the location
     > **NOTE**: <br>
     > This file contains a private key. Treat it like it is your password.
     > **Do not share**!
5. Share 'Contacts' with the service account created in step 4. Give read/write permisions
   > **NOTE**: <br>
   > the email address to share the sheet with can also be found in the JSON
   > file; grep for client_email

## Part B: Install gcloud and authenticate service account
1. Install (only) gcloud SDK for your OS. Skip options that prompt you to login or authenticate!
2. Initialize gcloud sdk. Say no if prompted to auth:
   - `gcloud init --console-only`
3. Authenticate the service account. Absolute path to key file is required.
   - `gcloud auth activate-service-account --key-file=/absolute/path/to/ke-file.json`
4. Verify service account's token (**do not share!**)
   - `gcloud auth print-identity-token`

Once the prerequisites are complete, you are ready to test Google Sheets API
using `curl`.

> **NOTE**: <br>
> The curl calls below are for use with OAuth, and should be considered as
> work in progress to make it usable with a service account. 
> DO NOT USE AS IS - needs more research to service key account with curl
>

# Tasks
## Set variables
```shell
# Example: 1DGhF4s4BQoi6SgdNATLtvLN_p2W8yQVkq4HlIDlkkgh
GSHEET=<YOUR_SHEET_ID>

# Never expose API keys publicly!
GTOKEN=`gcloud auth print-identity-token`
```

## Add contact (or rather append in Google Sheet terminology)
```shell
curl --request POST \
   "https://sheets.googleapis.com/v4/spreadsheets/${GSHEET}/values/A5%3AB5:append?includeValuesInResponse=true&insertDataOption=INSERT_ROWS&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=RAW" \
  --header "Authorization: Bearer ${GTOKEN}" \
  --header "Accept: application/json" \
  --header "Content-Type: application/json" \
  --data '{"values":[["name3","name3@email.com"]]}' \
  --compressed
```

## List contact
```shell
curl --request GET \
   "https://sheets.googleapis.com/v4/spreadsheets/${GSHEET}/values/A1%3AB2?majorDimension=COLUMNS&valueRenderOption=FORMATTED_VALUE" \                   
  --header "Authorization: Bearer ${GTOKEN}" \
  --header 'Accept: application/json' \
  --compressed
```

## Remove contact
```shell
curl --request POST \
   "https://sheets.googleapis.com/v4/spreadsheets/${GSHEET}/values/A5%3AA6:clear?" \
   --header "Authorization: Bearer ${GTOKEN}" \
   --header 'Accept: application/json' \
   --header 'Content-Type: application/json' \
   --data '{}' \
   --compressed
```

# References
## Google Sheets v4 API
1. [Overview](https://developers.google.com/sheets/api)
2. [Concepts](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id)
3. [Reference](https://developers.google.com/sheets/api/reference/rest)
4. [Samples - Read Operations](https://developers.google.com/sheets/api/samples/reading)
5. [Samples - Write Operations](https://developers.google.com/sheets/api/samples/writing)
6. [Samples - Row/Column Operations](https://developers.google.com/sheets/api/samples/rowcolumn)
7. [Google Sheets/Meta](https://www.reddit.com/r/googlesheets/comments/dr2hgk/list_of_all_url_parameters/)
## Happy easter egg hunting :-(
1. [The first clue](https://stackoverflow.com/questions/35599606/api-key-not-valid-error-when-trying-to-access-google-cloud-vision-api)
2. [Not quite what we want, only useful for public data](https://cloud.google.com/docs/authentication/api-keys?hl=en&visit_id=637302693952502207-3949955734&rd=1)
3. [Non public data access needs OAuth2, end of the road?](https://developers.google.com/sheets/api/guides/authorizing)
4. [Keep going...](https://stackoverflow.com/questions/27067825/how-to-access-google-spreadsheets-with-a-service-account-credentials)
5. [... to get to the source ...](https://github.com/googleapis/google-auth-library-nodejs#json-web-tokens)
6. [... and plan next steps](https://github.com/googleapis/google-api-nodejs-client#service-account-credentials)
## Elsewhere
1. [Google Sheets using PHP](https://www.fillup.io/post/read-and-write-google-sheets-from-php/)
2. [Google Sheets using Node.js](http://codingfundas.com/how-to-read-edit-google-sheets-using-node-js/index.html)