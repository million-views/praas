# Know your storage:
- [x] create if needed an AirTable account
- [x] create a custom base (e.g first-name, email)
- [x] access the token
- [ ] use curl to write and read back test data

# Activity log

## Add contact
```shell
curl -v -XPOST https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" --data @./airtable/contact-add.json
```

## List contact
```shell
curl https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts?api_key=<YOUR_API_KEY>
```

## Remove contact
curl -v -XDELETE "https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts/recvWfARzbshAwa3q" \
-H "Authorization: Bearer YOUR_API_KEY"
