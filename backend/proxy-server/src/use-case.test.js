const fs = require('fs');
const path = require('path');

const chai = require('chai');
const chaiHttp = require('chai-http');

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
        email: 'jack.2uc@last.com',
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
        email: 'jack.4uc@last.com',
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
        email: 'jack.7uc@last.com',
        hiddenFormField: 'hff-5',
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
        console.debug(res.body, res.status, res.error);
        expect(res.status).to.equal(200);
      });
      it('Bots have a field day and spam the heck out on the gateway | M submissions', async function () {
        const res = await proxyServer()
          .post('/')
          .set('Host', conduitA.host)
          .send(request3);
        console.debug(res.body, res.status, res.error);
        expect(res.status).to.equal(200);
      });
    }
  );
  context(
    'Registered user `hands-over` `conduit-B` to a 3rd party email validation service (EVS)',
    () => {
      it('should have get and patch permission', async function () {
        expect(conduitB.racm).to.eql(['GET', 'PATCH']);
      });
      it('EVS reads data using `conduit-B` and verifies if the email address is valid | by roll of a die', async function () {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        console.log('You rolled a ', diceRoll);
      });
      it('EVS marks a `row` to contain a valid email or not using `conduit-B`', async function () {});
    }
  );
  context(
    'Registered user `hands-over` `conduit-C` to a reports and visualization service (RAVS)',
    () => {
      it('should have only read permission', async function () {
        expect(conduitC.racm).to.eql(['GET']);
      });
      it('RAVS reads data using `conduit-C` and prepares a report ', async function () {});
      it('The report contains: signups, valid-email, invalid-email | by day, by week, by month', async function () {});
    }
  );
});
