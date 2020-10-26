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
  invalidCount = 0;

const stats = {
  submissions: { realSubmissionCount, botSubmissionCount },
  processes: { validCount, invalidCount },
};

const request1 = {
  records: [
    {
      fields: {
        name: 'first last',
        email: 'first@last.com',
        hiddenFormField: 'hff-5',
      },
    },
  ],
};

// non-compliant hiddenFormField
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
      xit('should have write permission to create a form', function () {
        // console.log('>> conduit A : ', conduitA.racm);
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
        console.log('>>> request2 length:', request2.records.length);
        // console.debug(res.body, res.status, res.error);
        console.log('>>> response length:', res.body.records.length);
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
        // console.debug(res.body, res.status, res.error);
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

      let pickArecord, recordId, isEmailValid;
      it('EVS reads data using `conduit-B` and verifies if the email address is valid | by roll of a die', async function () {
        // get all records from spreadsheet
        const res = await proxyServer().get('/').set('Host', conduitB.host);
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('records');
        // console.log('>>> no of records:', res.body.records.length);
        pickArecord = res.body.records;
        pickArecord = util.pickRandomlyFrom(pickArecord);
        // console.log('>>> You rolled dice and picked a record: ', pickArecord);
        /* console.log(
          '>>> email of the selected record:',
          pickArecord.fields.email
        ); */
        isEmailValid = util.validateEmail(pickArecord.fields.email);
        // console.log('>>> email vaild or invalid:', isEmailValid);
        recordId = pickArecord.id;
      });
      it('EVS marks a `row` to contain a valid email or invalid email, using `conduit-B`', async function () {
        const isValid = isEmailValid ? '1' : '0';

        // should PATCH entries for email validation(partial update)
        const req = {
          records: [
            {
              id: recordId,
              fields: {
                isValid: isValid,
              },
            },
          ],
        };
        const res = await proxyServer()
          .patch('/')
          .set('Host', conduitB.host)
          .send(req);
        // console.debug(res.body, res.status, res.error);
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('records');
      });
    }
  );
  context(
    'Registered user `hands-over` `conduit-C` to a reports and visualization service (RAVS)',
    () => {
      it('should have only read permission', async function () {
        expect(conduitC.racm).to.eql(['GET']);
      });
      it('RAVS reads data using `conduit-C` and prepares a report ', async function () {
        // get all records from spreadsheet
        const res = await proxyServer().get('/').set('Host', conduitC.host);
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('records');
        for (let i = 0; i < res.body.records.length; i++) {
          if (res.body.records[i].fields.isValid === '1') {
            stats.processes.validCount += 1;
          } else if (res.body.records[i].fields.isValid === '0') {
            stats.processes.invalidCount += 1;
          }
        }
      });
      it('The report contains: signups, valid-email, invalid-email | by day, by week, by month', async function () {
        console.log(
          '>>>> processed - valid count: ',
          stats.processes.validCount,
          ' invalid count: ',
          stats.processes.invalidCount
        );
        console.log(
          '>>> total records : ',
          stats.submissions.realSubmissionCount,
          ' bots count: ',
          stats.submissions.botSubmissionCount
        );
      });
    }
  );
});
