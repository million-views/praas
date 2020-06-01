# Live Share Hints
- Allow participants to be able to read/write for collaborative editing.
- Only named files can be given read/write access (for it to work).
- Only the initiator's viewport changes synchronize. Participant's viewport can be scrolled independently.
- If you lose sync with the initiator, log out and log back in...
- Live Spaces is probably not ready for prime time, stick to Live Share Session to collaborate.
- Mac users have issues with Audio; user either conference call or Meet for audio.

# TODOs captured
- We need to document CURI REST API (NOTE: CURI REST API emulates AirTable REST API)
  - Implies that we use AirTable terminology (in terms of database and tables)
  - In the context of sheets:
    - Database -> WorkBook or GSheet
    - Table    -> WorkSheet or Sheet

# Gateway Design Discussion

### Terminology
- NTS: Non-traditional storage (e.g AirTable)
- CURI: Conduit URI
- SURI: Service URI
- SURI-OBJECT-KEY: What ever path/parameters required to identify table/object inside the NTS.

### Example with AirTable

### Flow - how the gateway service can be used...
0. A registered user has an AirTable account and has created a base (named Contacts)
1. Registered user creates a conduit uri (curi) using the web-app to an NTS and sets on it that only POST method is to be supported 
2. The registered user hands over the curi to a wordpress or web designer to be used with a subscribe form
3. The web designer uses the curi in a form that may look as above and publishes the web page
4. Visitors land on the web site, and use the form to submit their firstname and email address
5. Gateway server receives a POST request
  - 5.1 Checks if POST is allowed for that CURI (if not allowed, reply with method not allowed http response code)
  - 5.2 Creates a new request to AirTable using the service uri (suri) and other details
  - 5.3 Sends a POST to suri with credentials provided by the registered user when the curi was created
  - 5.4 Receives the response from AirTable
6. Send back either the response from AirTable or the result of gateway server's validation checks (e.g method not allowed, too many requests, ...). NOTE: for other NTS types, the response code will need to be mapped to correspond to AirTable response codes.

#### Context
- Assume generated CURI is foo.example.com
- Assume endpoint AirTable base is https://api.airtable.com/v0/appgYyVces4B669Ma (for example, named Contacts database)
- Assume the table inside base is also called Contacts (<- this is a table name)
- Assume gateway is listening to *.example.com wildcard
- For the examples below, assume that foo.example.com (curi) supports GET, POST, DELETE http methods.


##### Add Contact

```shell
curl -v -XPOST https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts -H "Authorization: Bearer <YOUR_API_KEY>" -H "Content-Type: application/json" --data @./airtable/contact-add.json
```

-->

```
curl -v -XPOST https://foo.example.com/  --data @./airtable/contact-add.json
```
---

##### List all contacts
```shell
curl https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts?api_key=<YOUR_API_KEY>
```

-->

```
# List Contacts
curl https://foo.example.com
```
---

##### Remove contact
```shell
curl -v -XDELETE "https://api.airtable.com/v0/appgYyVces4B669Ma/Contacts/recvWfARzbshAwa3q" \
-H "Authorization: Bearer YOUR_API_KEY"
```

-->

```
curl -v -XDELETE "https://foo.example.com/recvWfARzbshAwa3q"
```
---


## Questions
1. Should the gateway server return error-codes and error messages from the NTS directly back to the user?
Ans: No. It is a gateway and the response should be translated to conform to AirTable conventions.


## Next Call:
- Please come prepared... read up ExpressJS links shared earlier.
