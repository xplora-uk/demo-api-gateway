function makeDate(unixTimeStampInSeconds) {
  return new Date(unixTimeStampInSeconds * 1000);
}

function unixTime(n = Date.now()) {
  if (n instanceof Date) n = n.getTime();
  return Math.floor(n / 1000);
}

module.exports = {
  makeDate,
  unixTime,
};
