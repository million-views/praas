// NOTE: these magic ip-addresses came from the following:
// ```shell
// for name in 'yahoo.com' 'google.com' 'facebook.com' 'amazon.com' 'ngrok.io' 'excalidraw.com' 'm5nv.com';
//   do dig $name +short;
// done

const allowed = [
  '52.95.116.115',
  '72.30.35.9',
  '98.137.246.7',
  '98.138.219.231',
  '176.32.103.205',
];

const denied = [
  '52.95.120.67',
  '72.30.35.10',
  '98.137.246.8',
  '98.138.219.232',
  '176.32.98.166',
];

// when called directly we just spit out critical information
// needed by utilities. The format is:
// OS: allowlist: denylist
//
// Example:
// running node lib/fake-ips.js on a MacOS will produce an output as below:
//
// darwin : 52.95.116.115,72.30.35.9 : 52.95.120.67,72.30.35.10
if (require.main === module) {
  const os = require('os');

  // console.log('called directly');
  console.log(
    os.platform(),
    ':',
    allowed.join(','),
    ':',
    denied.join(',')
  );
}

module.exports = { allowed, denied };
