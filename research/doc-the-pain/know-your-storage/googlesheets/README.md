# Google Sheets
Google Sheets API is not as friendly as Airtable API. A spreadsheet is a 
general purpose application that can be used for a wide range of use cases.
The complexity arising out of flexibility is hard to minimize and it shows!

In addition to the complexity of the API, the steps required to access it
the way we want to is not straight forward either. We want access using to
the API using a service account.

[Google service account](https://developers.google.com/identity/protocols/oauth2/service-account) is used for server to server applications without
user in the middle to authorize delegation. In order for the client server
to access the resource server API, an access token is needed. 

The access token can be self-signed and self-issued JWT by the client or an
opaqe token provided by the server. The former is attractive since it 
removes an extra round trip to gain access. 

Hidden in somewhere in the mountains of pages and links on Google's developer
site is the fact that the self-signed and self-issued JWT works only for
special class of services. For access to `Sheets API` we have to go through 
a two step process, which is not readily apparent. 

The instructions to obtain the access token from the command line may look
hairy. But that's exactly why this document is filed under `research`. The 
point of this exercise is to understand the details at a foundational level
rather than simply use what is dished out by Google or anyone else for that
matter.

> **NOTE**: the Internet is literally filled with junk; if you don't know
> precisely what you want you will end up running in circles. There are
> hundreds of articles that take you down the wrong path. This happened to 
> be the case on two different research sessions before a solution emerged.

## Credits
- The first research session was conducted by Kavitha producing insights
  that indicated that using Google API was not going to be easy from CLI.
- The second research session was conducted by Shine. One of the valuable
  insight that came out of it was to point attention to the existence of
  a `print-access-token` command. This allowed us to ask the right questions
  and led to the discovery of the process to obtain an access token
  without having to install `Google Cloud SDK` or special libraries, as
  indicated or suggested by so many other references on the net.

Thanks to both for the effort that went in to produce the insights and clues.

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
     - Set `PRIVATE_JSON_KEY_FILE` to point to location of JSON file
     > **NOTE**: <br>
     > This file contains a private key. Treat it like it is your password.
     > **Do not share**!
5. Share 'Contacts' with the service account created in step 
4. Give read/write permisions to the service account email
   > **NOTE**: <br>
   > the email address to share the sheet with can be found in the JSON
   > file; grep for client_email.

[Part B: Access Token]: #get-access-token
## Part B: Access Token
The object of this section is to make a request for an access token that
can then be used to access sheets API. To get the access token we have to
create a JWT signed by service account's private key.

### 1. Extract and setup environment variables
A JWT is composed of {header}.{claim set}.{encoded signature}. All three
parts are base64-url-encoded. The first two parts are constructed by us
and the third part is created by any crypto utility that can sign parts
one and two combined. Google expects the signing algorithm to be RS256.

Extract fields in JSON service account file from `Part A`:
- `kid` maps to `private_key_id` in service account file
- `iss` and `sub` map to `client_email` in service account file
- `aud` maps to `https://sheets.googleapis.com`
- `iat` should be set to current `Unix time`
- `exp` should be `+3600` seconds from `iat`
- `secret` corresponds to `private_key`

And set them as environment variables along with a few others that we will
be using to construct the JWT.

> **NOTE**: setting `sub` field is allowed only for certain services, and 
> requires domain-wide delegation, which in turn requires setting up a 
> consent screen. When set `sub` field contains the email address of the
> user the service account is trying to impersonate. Current documentation
> suggests that impersonation is not feasible for GSheets, therefore we must
> obtain an `access-token` to be able to read/write to GSheets.

```shell
ISS=$(\
   grep -o '"client_email":.*"' ${PRIVATE_JSON_KEY_FILE} \
 | cut -d ':' -f2 | tr -d ' '
)
AUD="https://www.googleapis.com/oauth2/v4/token"
IAT=`date +%s`
EXP=$(($IAT + 3600))
SCOPE="https://www.googleapis.com/auth/spreadsheets"
SECRET=$(\
   grep -o '"private_key":.*"' ${PRIVATE_JSON_KEY_FILE} \
 | cut -d ':' -f2 | sed 's/.*"\(.*\)".*/\1/'
)
```

### 2. Construct header, payload (claim set)
#### Construct the header
```shell
HEADER=$(tr -d "[:space:]" <<-EOM
  {
    "alg": "RS256"
  }
EOM
)

JWT_HEADER_ENCODED=$( \
   echo -n $HEADER    \
 | base64             \
 | sed s/\+/-/g       \
 | sed 's/\//_/g'     \
 | sed 's/=//g'       \
)
```

#### Construct the payload
```shell
# assumes no spaces allowed in values except in "scope"
PAYLOAD=$(tr -d "[:space:]" <<-EOM
{
  "iss": $ISS,
  "scope": "PLACE_HOLDER",
  "aud": "$AUD",
  "exp": $EXP,
  "iat": $IAT
}
EOM
)

PAYLOAD=$(echo -n ${PAYLOAD} | sed "s^PLACE_HOLDER^${SCOPE}^g");

JWT_PAYLOAD_ENCODED=$(\
   echo -n $PAYLOAD   \
 | base64             \
 | sed s/\+/-/g       \
 | sed 's/\//_/g'     \
 | sed 's/=//g'       \
)
```

### 3. Create signed JWT from encoded-header and encoded-payload
####  Convert secret, calculate hmac signature, concat to get JWT!

```shell
# Dump secret to a temp pem file for openssl to do its job
echo -e ${SECRET} > ./tmp.pem

HMAC_SIGNATURE=$(                                                    \
   echo -n "${JWT_HEADER_ENCODED}.${JWT_PAYLOAD_ENCODED}"            \
 | openssl dgst -sha256 -sign ./tmp.pem -binary                      \
 | openssl base64 -e -A                                              \
 | sed s/\+/-/g                                                      \
 | sed 's/\//_/g'                                                    \
 | sed 's/=//g'                                                      \
)
SIGNED_JWT="${JWT_HEADER_ENCODED}.${JWT_PAYLOAD_ENCODED}.${HMAC_SIGNATURE}"
rm ./tmp.pem
```

### 4. Obtain access token!!!
```shell
GGRANT="grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer"
GTOKEN=$(curl --request POST                                         \
  "https://www.googleapis.com/oauth2/v4/token"                       \
  --data "${GGRANT}&assertion=${SIGNED_JWT}"                         \
  --header "Content-Type: application/x-www-form-urlencoded"         \
  --header "Accept: application/json"                                \
)

echo ${GTOKEN}
```

If you see a response that looks as below the congratulations. You are now
ready to play with the Sheets API! If not, give up. You put on a good fight.
And it's best to move on!

```code
{
  "access_token": "1/8xbJqaOZXSUZbHLl5EOtu1pxz3fmmetKx9W8CV4t79M",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

# Tasks
## Set variables
```shell
# Sheets API endpoint
GSHEETS="https://sheets.googleapis.com/v4/spreadsheets"

# Example: 1DGhF4s4BQoi6SgdNATLtvLN_p2W8yQVkq4HlIDlkkgh
GSHEET=<YOUR_SHEET_ID>

# Never expose access token keys publicly!
GTOKEN=<find-it-in-the-access-token-you-got-from-an-earlier-step>
```

## List contact
```shell
GS_LIST_OPTIONS="majorDimension=COLUMNS&valueRenderOption=FORMATTED_VALUE"
curl --request GET                                           \
   "${GSHEETS}/${GSHEET}/values/A1%3AB2?${GS_LIST_OPTIONS}"  \
  --header "Authorization: Bearer ${GTOKEN}"                 \
  --header 'Accept: application/json'                        \
  --compressed
```

If Google gods are smiling, the response will look as below:
```code
{
  "range": "contacts!A1:B2",
  "majorDimension": "COLUMNS",
  "values": [
    [
      "First",
      "Jack"
    ],
    [
      "Email",
      "jack@example.com"
    ]
  ]
}
```

## Add contact (or rather append in Google Sheet terminology)
```shell
GS_ADD_OPTIONS="includeValuesInResponse=true&insertDataOption=INSERT_ROWS&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=RAW"
curl --request POST \
   "${GSHEETS}/${GSHEET}/values/A5%3AB5:append?${GS_ADD_OPTIONS}" \
  --header "Authorization: Bearer ${GTOKEN}"                      \
  --header "Accept: application/json"                             \
  --header "Content-Type: application/json"                       \
  --data '{"values":[["name3","name3@email.com"]]}'               \
  --compressed
```

If all goes well, the response will look as below:
```code
{
  "spreadsheetId": "1uS0LYz2z97o3EDpyLHcq5_E1zF04kt9BKkLD6Wg1r-U",
  "updates": {
    "spreadsheetId": "1uS0LYz2z97o3EDpyLHcq5_E1zF04kt9BKkLD6Wg1r-U",
    "updatedRange": "contacts!A5:B5",
    "updatedRows": 1,
    "updatedColumns": 2,
    "updatedCells": 2,
    "updatedData": {
      "range": "contacts!A5:B5",
      "majorDimension": "ROWS",
      "values": [
        [
          "name3",
          "name3@email.com"
        ]
      ]
    }
  }
}
```

## Remove contact
```shell
curl --request POST \
   "${GSHEETS}/${GSHEET}/values/A5%3AB5:clear?"                   \
   --header "Authorization: Bearer ${GTOKEN}"                     \
   --header 'Accept: application/json'                            \
   --header 'Content-Type: application/json'                      \
   --data '{}'                                                    \
   --compressed
```

If all goes well, the response will look as below:
```code
{
  "spreadsheetId": "1uS0LYz2z97o3EDpyLHcq5_E1zF04kt9BKkLD6Wg1r-U",
  "clearedRange": "contacts!A5:B5"
}
```

If you see a response as below then you will need to refresh your access
token by following [`instructions on how to here.`](#get-access-token)
```code
{
  "error": {
    "code": 401,
    "message": "Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.",
    "status": "UNAUTHENTICATED"
  }
}
```

# References
NOTE: `Google Sheets v4 API` section is relevant. The others do not lead
you to where you want to be.

## Google Sheets v4 API
1. [Overview](https://developers.google.com/sheets/api)
2. [Concepts](https://developers.google.com/sheets/api/guides/concepts#spreadsheet_id)
3. [Reference](https://developers.google.com/sheets/api/reference/rest)
4. [Samples - Read Operations](https://developers.google.com/sheets/api/samples/reading)
5. [Samples - Write Operations](https://developers.google.com/sheets/api/samples/writing)
6. [Samples - Row/Column Operations](https://developers.google.com/sheets/api/samples/rowcolumn)
7. [Google Sheets/Meta](https://www.reddit.com/r/googlesheets/comments/dr2hgk/list_of_all_url_parameters/)
8. [Google Service Account](https://developers.google.com/identity/protocols/oauth2/service-account#jwt-auth)
9. [Google Sheets REST API Discovery URI](https://sheets.googleapis.com/$discovery/rest?version=v4)
10. [Google Sheets REST API Scope](https://developers.google.com/identity/protocols/oauth2/scopes#sheets)

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
