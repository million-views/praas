# Know your storage:
- [] create if needed an AirTable account
- [] create a custom base (e.g first-name, email)
- [] access the token
- [] use curl to write and read back test data

# Activity log

## Add contact
```shell
curl -v -XPOST https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts -H "Authorization: Bearer <API-KEY>" -H "Content-Type: application/json" --data @./airtable/contact-add.json
```

## List contact
```shell
curl https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts?api_key=<API-KEY>
```

## Remove contact
TBD