# Know your storage
- [x] create if needed an AirTable or SmartSheet account
- [x] create a custom base (e.g first-name, email)
- [x] access the token
- [x] use curl to write and read back test data

## Activity log

### AirTable

#### Add contact
```shell
curl -v -XPOST https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" --data @./airtable/contact-add.json
```

#### List contact
```shell
curl https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts?api_key=<YOUR_API_KEY>
```

#### Remove contact
```shell
curl -v -XDELETE "https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts/recvWfARzbshAwa3q" \
-H "Authorization: Bearer YOUR_API_KEY"
```

### SmartSheet

#### Add contact
```shell
curl https://api.smartsheet.com/2.0/sheets/{sheetId}/rows \
-H "Authorization: Bearer YOUR_API_KEY" \
-H "Content-Type: application/json" \
-X POST \
--data @./smartsheet/contact-add.json
```
#### List contact
```shell
curl -X GET -H "Authorization: Bearer YOUR_API_KEY" "https://api.smartsheet.com/2.0/sheets/{sheetId}"
```
#### Remove contact
```shell
curl 'https://api.smartsheet.com/2.0/sheets/{sheetId}/rows?ids={rowId1},{rowId2},{rowId3}&ignoreRowsNotFound=true' \
-H "Authorization: Bearer YOUR_API_KEY" \
-X DELETE
```