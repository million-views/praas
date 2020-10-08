## (*) Get Meta Information of a named sheet and properties of interest
```json
{
  "spreadsheetId": "doc-hash-abc",
  "properties": {
    "title": "Contacts",
    "locale": "en_US",
    "timeZone": "Asia/Calcutta"
  },
  "sheets": [
    {
      "properties": {
        "sheetId": 0,
        "title": "Contacts",
        "index": 0,
        "sheetType": "GRID",
        "gridProperties": {
          "rowCount": 953,
          "columnCount": 26
        }
      },
      "data": [
        {
          "rowData": [
            {
              "values": [
                {
                  "formattedValue": "name"
                },
                {
                  "formattedValue": "email"
                },
                {
                  "formattedValue": "hiddenFormField"
                },
                {},
                {
                  "formattedValue": "after a break"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```


## (*) Attach metadata to row 1
```json
{
  "spreadsheetId": "doc-hash-abc",
  "replies": [
    {
      "createDeveloperMetadata": {
        "developerMetadata": {
          "metadataId": 276183675,
          "metadataKey": "header",
          "metadataValue": "whatever",
          "location": {
            "locationType": "ROW",
            "dimensionRange": {
              "dimension": "ROWS",
              "startIndex": 0,
              "endIndex": 1
            }
          },
          "visibility": "DOCUMENT"
        }
      }
    }
  ]
}
```

## (*) Retrieve developer meta data for row 1 by key
Notice that it returns multiple objects. GSheets let's you tag any
object multiple times with the same key. Each tag returns a unique
metadataId!
```json
{
  "matchedDeveloperMetadata": [
    {
      "developerMetadata": {
        "metadataId": 276183675,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 0,
            "endIndex": 1
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    },
    {
      "developerMetadata": {
        "metadataId": 1645140124,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 0,
            "endIndex": 1
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    },
    {
      "developerMetadata": {
        "metadataId": 1211685027,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 0,
            "endIndex": 1
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    },
    {
      "developerMetadata": {
        "metadataId": 1481882266,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 0,
            "endIndex": 1
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    }
  ]
}
```

After row 1 got moved. Notice the row index is updated!
```json
{
  "matchedDeveloperMetadata": [
    {
      "developerMetadata": {
        "metadataId": 276183675,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 4,
            "endIndex": 5
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    },
    {
      "developerMetadata": {
        "metadataId": 1481882266,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 4,
            "endIndex": 5
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    },
    {
      "developerMetadata": {
        "metadataId": 1645140124,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 4,
            "endIndex": 5
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    },
    {
      "developerMetadata": {
        "metadataId": 1211685027,
        "metadataKey": "header",
        "metadataValue": "whatever",
        "location": {
          "locationType": "ROW",
          "dimensionRange": {
            "dimension": "ROWS",
            "startIndex": 4,
            "endIndex": 5
          }
        },
        "visibility": "DOCUMENT"
      },
      "dataFilters": [
        {
          "developerMetadataLookup": {
            "metadataKey": "header"
          }
        }
      ]
    }
  ]
}
```

## (*) Delete developer meta data for row 1 by key
Notice that all meta data tags are deleted
```json

  "spreadsheetId": "doc-hash-abc",
  "replies": [
    {
      "deleteDeveloperMetadata": {
        "deletedDeveloperMetadata": [
          {
            "metadataId": 1481882266,
            "metadataKey": "header",
            "metadataValue": "whatever",
            "location": {
              "locationType": "ROW",
              "dimensionRange": {
                "dimension": "ROWS",
                "startIndex": 4,
                "endIndex": 5
              }
            },
            "visibility": "DOCUMENT"
          },
          {
            "metadataId": 1645140124,
            "metadataKey": "header",
            "metadataValue": "whatever",
            "location": {
              "locationType": "ROW",
              "dimensionRange": {
                "dimension": "ROWS",
                "startIndex": 4,
                "endIndex": 5
              }
            },
            "visibility": "DOCUMENT"
          },
          {
            "metadataId": 276183675,
            "metadataKey": "header",
            "metadataValue": "whatever",
            "location": {
              "locationType": "ROW",
              "dimensionRange": {
                "dimension": "ROWS",
                "startIndex": 4,
                "endIndex": 5
              }
            },
            "visibility": "DOCUMENT"
          },
          {
            "metadataId": 1211685027,
            "metadataKey": "header",
            "metadataValue": "whatever",
            "location": {
              "locationType": "ROW",
              "dimensionRange": {
                "dimension": "ROWS",
                "startIndex": 4,
                "endIndex": 5
              }
            },
            "visibility": "DOCUMENT"
          }
        ]
      }
    }
  ]
}
```

Request for metadata after deleting metadata `by key` or when no metadata
is attached will return an empty object.

```json
{}
```

## (*) Retrieve developer meta data by `metaId`
When not found:

```json
{
  "error": {
    "code": 404,
    "message": "No developer metadata with ID 276183675.",
    "status": "NOT_FOUND"
  }
}
```

When found:
```json
{
  "metadataId": 1383379683,
  "metadataKey": "header",
  "metadataValue": "whatever",
  "location": {
    "locationType": "ROW",
    "dimensionRange": {
      "dimension": "ROWS",
      "startIndex": 0,
      "endIndex": 1
    }
  },
  "visibility": "DOCUMENT"
}
```



## (*) Add one row at the end
```json
{
  "spreadsheetId": "doc-hash-abc",
  "tableRange": "Contacts!A1:C1",
  "updates": {
    "spreadsheetId": "doc-hash-abc",
    "updatedRange": "Contacts!A2:C2",
    "updatedRows": 1,
    "updatedColumns": 3,
    "updatedCells": 3,
    "updatedData": {
      "range": "Contacts!A2:C2",
      "majorDimension": "ROWS",
      "values": [
        [
          "Jack 1",
          "jack-1@example.com",
          "hff-1"
        ]
      ]
    }
  }
}
```

## (*) Add multiple rows at the end
```json
{
  "spreadsheetId": "doc-hash-abc",
  "tableRange": "Contacts!A1:C2",
  "updates": {
    "spreadsheetId": "doc-hash-abc",
    "updatedRange": "Contacts!A3:C8",
    "updatedRows": 6,
    "updatedColumns": 3,
    "updatedCells": 15,
    "updatedData": {
      "range": "Contacts!A3:C8",
      "majorDimension": "ROWS",
      "values": [
        [
          "Jack 2",
          "jack-2@example.com",
          "hff-2"
        ],
        [
          "Jack 3",
          "",
          "hff-3"
        ],
        [
          "Jack 4",
          "",
          "hff-4"
        ],
        [
          "Jack 5",
          "jack-5@example.com"
        ],
        [
          "Jack 6",
          "jack-6@example.com"
        ],
        [
          "Jack 7",
          "jack-7@example.com",
          "hff-7"
        ]
      ]
    }
  }
}
```

## (*) Update one (PATCH existing) row
```json
{
  "spreadsheetId": "doc-hash-abc",
  "totalUpdatedRows": 1,
  "totalUpdatedColumns": 1,
  "totalUpdatedCells": 1,
  "responses": [
    {
      "updatedData": {
        "range": "Contacts!A2",
        "values": [
          [
            "Jack 1 patched"
          ]
        ]
      }
    }
  ]
}
```

## (*) Update multiple (PATCH existing) rows
```json
{
  "spreadsheetId": "doc-hash-abc",
  "totalUpdatedRows": 2,
  "totalUpdatedColumns": 2,
  "totalUpdatedCells": 3,
  "responses": [
    {
      "updatedData": {
        "range": "Contacts!A3:C3",
        "values": [
          [
            "Jack 2",
            "jack-2@example.com",
            "hff-2 updated"
          ]
        ]
      }
    },
    {
      "updatedData": {
        "range": "Contacts!A4:C4",
        "values": [
          [
            "Jack 3 got a boost",
            "",
            "I did not exist before!"
          ]
        ]
      }
    }
  ]
}
```

## (*) Replace one (PUT destructively existing) row
```json
{
  "spreadsheetId": "doc-hash-abc",
  "totalUpdatedRows": 1,
  "totalUpdatedColumns": 3,
  "totalUpdatedCells": 3,
  "responses": [
    {
      "updatedData": {
        "range": "Contacts!A2:C2",
        "values": [
          [
            "Jack 1",
            "jack-1@example.com"
          ]
        ]
      }
    }
  ]
}
```

## (*) Replace multiple (PUT destructively existing) rows
```json
{
  "spreadsheetId": "doc-hash-abc",
  "totalUpdatedRows": 2,
  "totalUpdatedColumns": 3,
  "totalUpdatedCells": 6,
  "responses": [
    {
      "updatedData": {
        "range": "Contacts!A3:C3",
        "values": [
          [
            "Jack 2"
          ]
        ]
      }
    },
    {
      "updatedData": {
        "range": "Contacts!A4:C4",
        "values": [
          [
            "",
            "",
            "hff-3"
          ]
        ]
      }
    }
  ]
}
```

## (*) Get one row
```json
{
  "spreadsheetId": "doc-hash-abc",
  "valueRanges": [
    {
      "range": "Contacts!A2:C2",
      "majorDimension": "ROWS",
      "values": [
        [
          "Jack 1",
          "jack-1@example.com"
        ]
      ]
    }
  ]
}
```

## (*) Get discontiguous rows
```json
{
  "spreadsheetId": "doc-hash-abc",
  "valueRanges": [
    {
      "range": "Contacts!A2:C2",
      "majorDimension": "ROWS",
      "values": [
        [
          "Jack 1",
          "jack-1@example.com"
        ]
      ]
    },
    {
      "range": "Contacts!A4:C4",
      "majorDimension": "ROWS",
      "values": [
        [
          "",
          "",
          "hff-3"
        ]
      ]
    },
    {
      "range": "Contacts!A6:C6",
      "majorDimension": "ROWS",
      "values": [
        [
          "Jack 5",
          "jack-5@example.com"
        ]
      ]
    }
  ]
}
```

## (*) Get all rows
```json
{
  "spreadsheetId": "doc-hash-abc",
  "valueRanges": [
    {
      "range": "Contacts!A2:C953",
      "majorDimension": "ROWS",
      "values": [
        [
          "Jack 1",
          "jack-1@example.com"
        ],
        [
          "Jack 2"
        ],
        [
          "",
          "",
          "hff-3"
        ],
        [
          "Jack 4",
          "",
          "hff-4"
        ],
        [
          "Jack 5",
          "jack-5@example.com"
        ],
        [
          "Jack 6",
          "jack-6@example.com"
        ],
        [
          "Jack 7",
          "jack-7@example.com",
          "hff-7"
        ]
      ]
    }
  ]
}
```

## (*) Delete one row
```json
{
  "spreadsheetId": "doc-hash-abc",
  "updatedSpreadsheet": {
    "sheets": [
      {
        "properties": {
          "sheetId": 0,
          "title": "Contacts"
        },
        "data": [
          {
            "rowData": [
              {
                "values": [
                  {
                    "formattedValue": "Jack 2"
                  },
                  {
                    "formattedValue": "jack-2@example.com"
                  },
                  {
                    "formattedValue": "hff-2"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## (*) Delete multiple rows
```json
{
  "spreadsheetId": "doc-hash-abc",
  "updatedSpreadsheet": {
    "sheets": [
      {
        "properties": {
          "sheetId": 0,
          "title": "Contacts"
        },
        "data": [
          {
            "rowData": [
              {
                "values": [
                  {
                    "formattedValue": "Jack 3"
                  },
                  {},
                  {
                    "formattedValue": "hff-3"
                  }
                ]
              },
              {
                "values": [
                  {
                    "formattedValue": "Jack 4"
                  },
                  {},
                  {
                    "formattedValue": "hff-4"
                  }
                ]
              },
              {
                "values": [
                  {
                    "formattedValue": "Jack 5"
                  },
                  {
                    "formattedValue": "jack-5@example.com"
                  }
                ]
              },
              {
                "values": [
                  {
                    "formattedValue": "Jack 6"
                  },
                  {
                    "formattedValue": "jack-6@example.com"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
