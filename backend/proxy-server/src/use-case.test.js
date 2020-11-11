const fs = require('fs');
const path = require('path');

const chai = require('chai');
const chaiHttp = require('chai-http');

const util = require('../../lib/util');

const expect = chai.expect;
chai.use(chaiHttp);

const proxyHost = 'localhost';
const proxyPort = '5000';
const proxyServerURL = `http://${proxyHost}:${proxyPort}`;
const proxyServer = () => chai.request(proxyServerURL);

// Test Data
const testConduits = JSON.parse(
  fs.readFileSync(path.resolve('.test-data-curi.json'))
);

const conduitA = testConduits.conduitA;
const conduitB = testConduits.conduitB;
const conduitC = testConduits.conduitC;

const realSubmissionCount = 0,
  botSubmissionCount = 0,
  validCount = 0,
  invalidCount = 0,
  unverified = 0;

const stats = {
  submissions: { realSubmissionCount, botSubmissionCount },
  processes: { validCount, invalidCount, unverified },
};

const request2 = {
  records: [
    {
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
    },
    {
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
      },
    },
    {
      fields: {
        name: 'Jack L3uc',
        email: 'jack.3uc@last.com',
        hiddenFormField: 'hff-2',
      },
    },
    {
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
      },
    },
    {
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
      },
    },
    {
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
    },
    {
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
    },
    {
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L2uc',
        email: 'jack.2uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L3uc',
        email: 'jack.3uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L8uc',
        email: 'jack.8uc@last.com',
        hiddenFormField: 'hff',
      },
    },
  ],
};

const request3 = {
  records: [
    {
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L2uc',
        email: 'jack.2uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L3uc',
        email: 'jack.3uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last.com',
        hiddenFormField: 'hff',
      },
    },
    {
      fields: {
        name: 'Jack L8uc',
        email: 'jack.8uc@last.com',
        hiddenFormField: 'hff',
      },
    },
  ],
};
describe('Registered user creates three conduits to a previously setup `contacts` NTS', function () {
  context(
    'Registered user `hands-over` `conduit-A` to a widget-designer',
    () => {
      it('should have write permission to create a form', function () {
        expect(conduitA.racm).to.eql(['POST']);
      });
    }
  );
  context(
    ' Registered user `publishes` a page with the embedded form ',
    () => {
      it('Visitors provide their `first-name` and `email` | N submissions', async function () {
        const res = await proxyServer()
          .post('/')
          .set('Host', conduitA.host)
          .send(request2);
        expect(res.status).to.equal(200);
        stats.submissions.realSubmissionCount = res.body.records.length;
        stats.submissions.botSubmissionCount =
          request2.records.length - res.body.records.length;
      });
      it('Bots have a field day and spam the heck out on the gateway | M submissions', async function () {
        const res = await proxyServer()
          .post('/')
          .set('Host', conduitA.host)
          .send(request3);
        expect(res.status).to.equal(200);
        if (res.body.records === undefined) {
          stats.submissions.botSubmissionCount = request3.records.length;
        } else {
          stats.submissions.botSubmissionCount =
            request3.records.length - res.body.records.length;
        }
      });
    }
  );
  context(
    'Registered user `hands-over` `conduit-B` to a 3rd party email validation service (EVS)',
    () => {
      it('should have get and patch permission', async function () {
        expect(conduitB.racm).to.eql(['GET', 'PATCH', 'PUT']);
      });

      let recordId, isEmailValid;
      it('EVS reads data using `conduit-B`, verifies if the email address is valid and marks a `row` to contain a valid email or invalid email | by roll of a die', async function () {
        // get all records from spreadsheet
        const res = await proxyServer().get('/').set('Host', conduitB.host);
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('records');

        let recordsToValidate = res.body.records;

        const filterUndefinedConduits = (recordsToValidate) => {
          recordsToValidate = Object.values(
            recordsToValidate.filter(
              (recordsToValidate) =>
                recordsToValidate.fields.validity === undefined
            )
          );
          return recordsToValidate;
        };

        const updateConduit = async (recordId, isValid) => {
          console.log('Updating ...');
          // should PATCH entries for email validation(partial update)
          const req = {
            records: [
              {
                id: recordId,
                fields: {
                  validity: isValid,
                },
              },
            ],
          };
          const res1 = await proxyServer()
            .patch('/')
            .set('Host', conduitB.host)
            .send(req);
          expect(res1.status).to.equal(200);
          expect(req.records.id).to.eql(res1.body.records.id);
        };

        const validateRecords = (recordsToValidate) => {
          recordsToValidate.map(async (val) => {
            console.log('Validating ...');
            isEmailValid = util.validateEmail(val.fields.email);
            recordId = val.id;
            const isValid = isEmailValid ? 'valid' : 'invalid';
            await updateConduit(recordId, isValid);
          });
        };

        recordsToValidate = filterUndefinedConduits(recordsToValidate);
        validateRecords(recordsToValidate);

        // get all records from spreadsheet
        const res1 = await proxyServer().get('/').set('Host', conduitB.host);
        expect(res1.status).to.equal(200);
        expect(res1.body).to.haveOwnProperty('records');
        console.log('Validated and Updated records in sheet');

        // NOTE - to check the valididty of all records in spreadsheet takes longer time
        // need to fix time or the logis for checking the validity of all records in spreadsheet
        /* for (let i = 0; i < res1.body.records.length; i++) {
          expect(res1.body.records[i].fields.validity).not.to.be.undefined;
        } */
      });
      xit('EVS marks a `row` to contain a valid email or invalid email, using `conduit-B`', async function () {});
    }
  );
  context(
    'Registered user `hands-over` `conduit-C` to a reports and visualization service (RAVS)',
    () => {
      it('should have only read permission', async function () {
        expect(conduitC.racm).to.eql(['GET']);
      });

      let report = [];
      it('RAVS reads data using `conduit-C` and prepares a report ', async function () {
        // get all records from spreadsheet
        const res = await proxyServer().get('/').set('Host', conduitC.host);
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('records');
        for (let i = 0; i < res.body.records.length; i++) {
          if (res.body.records[i].fields.validity === 'valid') {
            stats.processes.validCount += 1;
          } else if (res.body.records[i].fields.validity === 'invalid') {
            stats.processes.invalidCount += 1;
          } else if (res.body.records[i].fields.validity === undefined) {
            stats.processes.unverified += 1;
          }
        }

        // report status:
        // - email is valid                                       (A)  5
        // - email is invalid                                     (B) 15
        // - email is unverified (validity === undefined)         (C) 10
        //
        // (A + B + C + dropped) === (total records submitted)
        // const records = [
        //   { a: { ts: 1.1, v: true } },
        //   { b: { ts: 1.2, v: false } },
        //   { c: { ts: 2.1, v: false } },
        //   { d: { ts: 2.2, v: true } },
        //   { e: { ts: 2.3, v: true } },
        //   { f: { ts: 3.1, v: false } },
        //   { g: { ts: 3.2 } },
        //   { g: { ts: 4.1 } },
        // ];

        // const groupedByDay = {
        //   1: {valid: 1, invalid: 1, unverified: 0},
        //   2: {valid: 2, invalid: 1, unverified: 0},
        //   3: {valid: 0, invalid: 1, unverified: 1},
        //   4: {valid: 0, invalid: 0, unverified: 1},
        // }
        /*
            - 50 records submitted in total
            - 10 records should have been dropped
            - 40 records processed by EVS
              - 20: valid, 10: invalid, 10
        */

        // Group by time period - By 'seconds' | 'day' | 'week' | 'month' | 'year'
        // -----------------------------------------------------------------------
        const groupByTimePeriod = function (obj, createdtimestamp, period) {
          const objPeriod = {};
          const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
          for (let i = 0; i < obj.length; i++) {
            const timestamp = obj[i][createdtimestamp];
            let d = new Date(timestamp);
            // pretend this can group by second, day, week, month but for now we just
            // use the seconds for grouping
            if (period === 'seconds') {
              d = d.getSeconds();
            } else if (period === 'day') {
              // console.log('>>>findDate:', d.getDate());
              d = Math.floor(d.getTime() / oneDay);
            } else if (period === 'week') {
              d = Math.floor(d.getTime() / (oneDay * 7));
            } else if (period === 'month') {
              // console.log('>>>findMonth:', d.getMonth() + 1);
              d = (d.getFullYear() - 1970) * 12 + d.getMonth();
            } else if (period === 'year') {
              d = d.getFullYear();
            } else {
              console.log(
                'groupByTimePeriod: You have to set a period! seconds | day | week | month | year'
              );
            }
            // define object key and check for validity
            objPeriod[d] = objPeriod[d] || { valid: 0, invalid: 0, unverified: 0 };
            const stats = objPeriod[d];
            if (obj[i].fields.validity === 'valid') {
              stats.valid += 1;
            } else if (obj[i].fields.validity === 'invalid') {
              stats.invalid += 1;
            } else if (obj[i].fields.validity === undefined) {
              stats.unverified += 1;
            }
          }
          return objPeriod;
        };

        // let objPeriodDay = groupByTimePeriod(rec, 'createdTime', 'day');
        // let objPeriodWeek = groupByTimePeriod(rec, 'createdTime', 'week');
        // let objPeriodMonth = groupByTimePeriod(rec, 'createdTime', 'month');
        /* const objPeriodYear = groupByTimePeriod(
          res.body.records,
          'createdTime',
          'year'
        ); */
        const objPeriodSeconds = groupByTimePeriod(res.body.records, 'createdTime', 'seconds');
        // eslint-disable-next-line no-unused-vars
        report = objPeriodSeconds;
      });
      it('The report contains: signups, valid-email, invalid-email | by day, by week, by month', async function () {
        console.log(
          'Number of Sign Ups: ',
          stats.submissions.realSubmissionCount,
          'Number of spamming by bots: ',
          stats.submissions.botSubmissionCount
        );
        const totalSubmitedRecords =
          stats.submissions.realSubmissionCount +
          stats.submissions.botSubmissionCount;

        const toatalRecordsProcessedByEVS =
          stats.processes.validCount +
          stats.processes.invalidCount +
          stats.processes.unverified;

        console.log('Report Status:');
        console.log('email is valid - ', stats.processes.validCount);
        console.log('email is invalid - ', stats.processes.invalidCount);
        console.log('email is unverified - ', stats.processes.unverified);
        expect(stats.submissions.realSubmissionCount).eql(
          stats.processes.validCount +
            stats.processes.invalidCount +
            stats.processes.unverified
        );
        expect(totalSubmitedRecords).eql(
          toatalRecordsProcessedByEVS + stats.submissions.botSubmissionCount
        );

        // TO DO
        // Logic to group report of submitted records by
        // seconds | day | week | month | year
        // As there are less number of records submitted
        // the report is available only for Group by Seconds
        // Need to enhance this report for day | week | month | year

        console.log('Report by Seconds:', report);
      });
    }
  );
});
