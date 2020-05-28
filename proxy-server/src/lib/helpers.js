function padLeft(val, len=2, padChar='0') {
  return (''+val).padStart(len, padChar);
}

function printTime() {
  const now = new Date();
  return now.getFullYear() +
  '-' + padLeft((now.getMonth() + 1)) +
  '-' + padLeft(now.getDate()) +
  ' ' + padLeft(now.getHours()) +
  ':' + padLeft(now.getMinutes()) +
   ':' + padLeft(now.getSeconds());
}

module.exports = { printTime };
