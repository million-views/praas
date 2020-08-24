# PraaS Proxy Server

Follow [instructions to get the servers up](../README.md) before running
gateway tests.

## Testing

### AllowList

There are a few hinderances to test the `allowList` feature since it is
not possible to mock the remote address that is making a request. Hence,
a set of [pre-defined pseudo-random IPs] are added to the local loopback
network interface. Requests are then bound to these IPs and 'proxied'
through the same network interface.

The network can be set up and destroyed using the same [script].

- to add the pseudo-random IP addresses to the loopback interface, run
  ```sh
  loopback-network.sh add
  ```
- to delete the IP addresses from the loopback interface, run
  ```sh
  loopback-network.sh del
  ```

The script has been tested with `ifconfig` ( `net-utils` ) and `ip`

:warning: Since this changes system settings, the script requires
elevated privileges ( `sudo` ) to run. The script will prompt for the
administration password when it attempts to run commands that require
elevated privileges

### Airtable

Currently, only Airtable functionality is present in the application.
Hence, the tests depend on some configuration on Airtable for the tests
to work. Unfortunately, the Airtable API only allows to operate on an
existing Base and does not allow use to create, update or delete a
Base itself. So, the following assumptions are made that the tester has
to have as a pre-requisite to running the test suite.

- tester has an Airtable account
- tester has setup a Base on their account
- required details, viz, Airtable API Endpoint, API Key, Service
  Object URI are entered correctly in the `.env.conduit-user` file
  ( Refer to the `.env.conduit-user.example` file for example /
  reference of the keys to be used in `.env.conduit-user` )
- `SERVICE_OBJECT_KEY` value corresponds to the Airtable Base
- Airtable Base should be setup with:
  - 3 fields named `name`, `email`, `hiddenFormField`
  - all field names are case sensitive for the purpose of testing
  - the fields **should** be of type `Single line text`

[pre-defined pseudo-random ips]: ../lib/fake-ips.js
[script]: ../util/loopback-network.sh

### Running tests

To execute the gateway tests, execute the following commands in the order after adding the necessary configs in .env.conduit-user file.

1. Add the proxys - `./util/loopback-network.sh`
2. Generate test data - `npm run test-model`. The model testing also generates some curi test data required during the gateway testing.
3. Run the resource server - `npm run start-resource-server`
4. Run the gateway server - `npm run start-gateway-server`
5. Run the gateway tests - `npm run test-gateway`
