# Smart Sheet
Smartsheet application's lineage is reflected in its API. The challenge in 
using it as a database is that the user has to know the columnIds before
being able to read or write.

> NOTE: <br>
> This document exists only to preserve the research that was done to
> test the suitability of Smartsheet to be an NTS. It can be safely 
> skipped in its entirety.
>

# Prerequisites
Apparantly, only licensed Smartsheet users on Business and Enterprise
plans have access to the API by generating Access Tokens. You can find this
in API Access under the Personal Settings option of the Account menu.

# Tasks
## Set variables
```shell
# Example: appgYyVces4B669Na
SS_SID=<YOUR_SHEET_ID>

# Never expose API keys publicly!
SS_AKEY=<YOUR_API_KEY>
```

## Add contact
```shell
curl -X POST \
  https://api.smartsheet.com/2.0/sheets/${SS_SID}/rows \
  -H "Authorization: Bearer ${SS_AKEY}" \
  -H "Content-Type: application/json" \
  -X POST \
  --data @./smartsheet/contact-add.json
```

## List contact
```shell
curl -X GET \
  "https://api.smartsheet.com/2.0/sheets/${SS_SID}" \
  -H "Authorization: Bearer ${SS_AKEY}"
```

## Remove contact
```shell
curl -X DELETE \
  "https://api.smartsheet.com/2.0/sheets/${SS_SID}/rows?ids={rowId1},{rowId2},{rowId3}&ignoreRowsNotFound=true" \
-H "Authorization: Bearer ${SS_AKEY}"
```

# References
1. [Smartsheet API](https://smartsheet-platform.github.io/api-docs/)
2. [Find columns quicker with a column map](https://developers.smartsheet.com/blog/find-columns-quicker-with-a-column-map)
