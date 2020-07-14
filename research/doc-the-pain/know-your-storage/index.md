# Know your storage
Spreadsheets constitute what can be described as a non-traditional storage
(NTS) medium. This document will guide the reader to gain understanding of
what it takes to be able to read/write to these storage types. And may be,
just may be inspire you to build the next SaaS unicorn! [^1]

[^1]: A few think that most SaaS products are [glorified spreadsheets](https://twitter.com/DavidSacks/status/1078755080478715904). We don't think so. Even
if they are, it is bloody hard to build an application on top of a
spreadsheet. If we can make that task even a little bit easier then this
project will have earned its badge.

# Activity Overview
- [x] create if needed an AirTable or Google account
- [x] create a custom base (e.g first-name, email), or google-sheet
      named Contacts
- [x] read support documentation to figure out how to obtain an access
      token
- [x] read api documentation on how to add, update, delete rows using
      service provider's REST API
- [x] use curl to write and read back test data using the access token

After obtaining the access token, try the following activities to be
able to read/write to a chosen NTS. Verify the data via the vendor's 
application as well.

Instructions and references can be found below for each NTS.
- [AirtTable](airtable/README.md)
- [GoogleSheets](googlesheets/README.md)

> NOTE <br>
> Smartsheet's suitability to be an NTS is hindered by its domain specific
> API (which has its roots in project management). Making it unsuitable 
> for many of the usecases that are feasible with other NTS types.
> 
> Moreover, the website of Smartsheet with its gazillion trackers 
> is a turn off. So, no more time will be invested in Smartsheet.
>

## References
1. [Line folding with curl](https://stackoverflow.com/questions/32341091/multiline-curl-command)
2. [Data option in curl](https://ec.haxx.se/cmdline/cmdline-options)