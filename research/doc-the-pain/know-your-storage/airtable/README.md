# AirTable
Among all the REST APIs studied for NTS, AirTable comes out to be the most
developer friendly. That's probably because they started with a database
first design.

  > **NOTE**: <br>
  > AirTable API documentation is generated for each `base`

# Prep Work
- Create a base
- Obtain a token (API key)

# Tasks

## Set variables
```shell
# Example: appgYyVces4B669Na
AT_BASE=<YOUR_BASE_ID>

# Never expose API keys publicly!
AT_AKEY=<YOUR_API_KEY>
```

## Add contact
```shell
curl -v -X POST \
  https://api.airtable.com/v0/${AT_BASE}/Contacts \
  -H "Authorization: Bearer ${AT_AKEY}" \
  -H "Content-Type: application/json" --data @contact-add.json
```

## List contact
```shell
curl -X GET \
  https://api.airtable.com/v0/${AT_BASE}/Contacts \
  -H "Authorization: Bearer ${AT_AKEY}
```

## Remove contact
```shell
curl -v -X DELETE \
  "https://api.airtable.com/v0/${AT_BASE}/Contacts/recvWfARzbshAwa3q" \
  -H "Authorization: Bearer ${AT_KEY}"
```

## References
1. [AirTable](https://airtable.com/)
