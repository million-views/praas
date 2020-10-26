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

const responses = {
  records: [
    {
      id: 'rec1neIdJ0n1QxkaU',
      fields: {
        name: 'Jack L1uc',
        email: 'jackx@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-23T11:18:07.000Z',
    },
    {
      id: 'rec1u8JHDjMGXsnuc',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:35.000Z',
    },
    {
      id: 'rec2jziaL7RkcFC9c',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:35.000Z',
    },
    {
      id: 'rec45dZppPSvQhFjm',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
        isValid: '0',
      },
      createdTime: '2020-10-25T10:31:23.000Z',
    },
    {
      id: 'rec6ORplbNQbRp5Of',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:40:25.000Z',
    },
    {
      id: 'rec7ArgFSxb7xYf2n',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:35.000Z',
    },
    {
      id: 'rec7Rmr71UKyakyyJ',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:46.000Z',
    },
    {
      id: 'rec7SuOcS1dkkUGzw',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T10:26:49.000Z',
    },
    {
      id: 'rec9N46V9oKV12PsM',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T10:26:49.000Z',
    },
    {
      id: 'recAvAfLNDsGYw4XG',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:40:25.000Z',
    },
    {
      id: 'recAvAhElHdNcDVLs',
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-25T10:31:23.000Z',
    },
    {
      id: 'recBTgKBaCZwDp0jD',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:38:23.000Z',
    },
    {
      id: 'recBybSMB2bnUt128',
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:46.000Z',
    },
    {
      id: 'recCkOFZNuK8vY0Ia',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:39:16.000Z',
    },
    {
      id: 'recEIMAC1H68Ac7JC',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:38:23.000Z',
    },
    {
      id: 'recEQtmFodcmSILJ4',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:38:23.000Z',
    },
    {
      id: 'recEqJL6hAsBXQYNO',
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:35.000Z',
    },
    {
      id: 'recHp6JdGHuQ6u4uK',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-23T11:18:07.000Z',
    },
    {
      id: 'recIOdaexQHL8rQIV',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-23T11:18:07.000Z',
    },
    {
      id: 'recMJ32a36xoIDxUh',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T10:31:23.000Z',
    },
    {
      id: 'recNlER7zbURvF0Kg',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-25T10:26:49.000Z',
    },
    {
      id: 'recP9h65dbWGLi3q0',
      fields: {
        name: 'Jack L2uc',
        email: 'jack.2uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T10:26:49.000Z',
    },
    {
      id: 'recPMjKO8drNazPnn',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2016-7-25T10:26:49.000Z',
    },
    {
      id: 'recRyzmLtzVCyaQEy',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T10:31:23.000Z',
    },
    {
      id: 'recSGeU0QTwsVCawQ',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2017-2-25T14:38:23.000Z',
    },
    {
      id: 'recSpMVKkdrV9rLLP',
      fields: {
        name: 'Jack L2uc',
        email: 'jack.2uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '0',
      },
      createdTime: '2020-10-23T11:18:07.000Z',
    },
    {
      id: 'recUIVTXuiAFAGBux',
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:40:25.000Z',
    },
    {
      id: 'recXQQZnMor6cHCWg',
      fields: {
        name: 'Jack L6uc',
        email: 'jackx@last.com',
        hiddenFormField: 'hff-5',
        isValid: '0',
      },
      createdTime: '2017-03-23T11:18:07.000Z',
    },
    {
      id: 'recZ5iOxM4cNFxb2d',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-25T10:31:23.000Z',
    },
    {
      id: 'recaSFDilLqYAkkSP',
      fields: {
        name: 'Jack L4uc',
        email: 'jack',
        hiddenFormField: 'hff-5',
        isValid: '0',
      },
      createdTime: '2020-10-25T10:26:49.000Z',
    },
    {
      id: 'recddYbrTLHLNPmxR',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:39:16.000Z',
    },
    {
      id: 'receJg1YHczrr7z8Q',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2018-4-25T14:39:16.000Z',
    },
    {
      id: 'receMyRyTH81XLbmV',
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:39:16.000Z',
    },
    {
      id: 'recehYbRvTY2QjiCd',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:39:16.000Z',
    },
    {
      id: 'receyyFh3nCzJPcdJ',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:40:25.000Z',
    },
    {
      id: 'reciBE4oK8eQn7Rk4',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-1-25T14:40:25.000Z',
    },
    {
      id: 'reciO1bltpp0ZCDXS',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:46.000Z',
    },
    {
      id: 'reckW7YARz1SzxdKw',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:38:23.000Z',
    },
    {
      id: 'recknwnfX0WzUQ9PK',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2020-10-25T10:31:23.000Z',
    },
    {
      id: 'reco7AwJhqdcAbpYM',
      fields: {
        name: 'Jack L1uc',
        email: 'jack.1uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2019-1-26T11:16:46.000Z',
    },
    {
      id: 'recqWlekuTfzxHbth',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:39:16.000Z',
    },
    {
      id: 'recrvI8BWUk7XCiew',
      fields: {
        name: 'Jack L4uc',
        email: 'jack.4uclast.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:35.000Z',
    },
    {
      id: 'recv051hDKY0O6cJD',
      fields: {
        name: 'Jack L7uc',
        email: 'jack.7uc@last',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:46.000Z',
    },
    {
      id: 'recvikRWw2VpKr7dx',
      fields: {
        name: 'Jack L6uc',
        email: 'jack.6uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:40:25.000Z',
    },
    {
      id: 'recvjcxEyT69UUNNW',
      fields: {
        name: 'Jack L5uc',
        email: 'jackx@last.com',
        hiddenFormField: 'hff-5',
        isValid: '1',
      },
      createdTime: '2019-10-23T11:18:07.000Z',
    },
    {
      id: 'recvlfMyYQ8bXRMsu',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-26T11:16:46.000Z',
    },
    {
      id: 'recwobImwV0WMa3i4',
      fields: {
        name: 'Jack L2uc',
        email: 'jack$$$2uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2020-10-25T14:38:23.000Z',
    },
    {
      id: 'recwojk0Ma3XNSpUM',
      fields: {
        name: 'Jack L5uc',
        email: 'jack.5uc@last.com',
        hiddenFormField: 'hff-5',
      },
      createdTime: '2019-10-26T11:16:35.000Z',
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
      it('should have write permission to create a form', function () {
        expect(conduitA.racm).to.eql(['POST']);
      });
    }
  );
  context(
    ' Registered user `publishes` a page with the embedded form ',
    () => {
      xit('Visitors provide their `first-name` and `email` | N submissions', async function () {
        const res = await proxyServer()
          .post('/')
          .set('Host', conduitA.host)
          .send(request2);
        expect(res.status).to.equal(200);
        stats.submissions.realSubmissionCount = res.body.records.length;
        stats.submissions.botSubmissionCount =
          request2.records.length - res.body.records.length;
      });
      xit('Bots have a field day and spam the heck out on the gateway | M submissions', async function () {
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

      let pickArecord, recordId, isEmailValid;
      it('EVS reads data using `conduit-B` and verifies if the email address is valid | by roll of a die', async function () {
        // get all records from spreadsheet
        const res = await proxyServer().get('/').set('Host', conduitB.host);
        expect(res.status).to.equal(200);
        expect(res.body).to.haveOwnProperty('records');
        pickArecord = res.body.records;
        pickArecord = util.pickRandomlyFrom(pickArecord);
        isEmailValid = util.validateEmail(pickArecord.fields.email);
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
        const date = new Date('2019-10-26T11:16:35.000Z');
        console.log(
          '>>> day:',
          date.getDate(),
          ' month:',
          date.getMonth() + 1,
          ' year:',
          date.getFullYear(),
          ' of createdTime - ',
          responses.records[0].createdTime
        );
        let i = 0,
          // eslint-disable-next-line prefer-const
          groups = {},
          year,
          day;
        for (let item of responses.records) {
          // console.log(item);
          item = new Date(item.createdTime);
          year = item.getFullYear();
          day = item.getDate();
          groups[year] || (groups[year] = {}); // exists OR create {}
          groups[year][day] || (groups[year][day] = []); // exists OR create []
          groups[year][day].push(item);
        }
        console.log('>>> groups:', groups);
      });
    }
  );
});
