const { newLogger } = require('@xplora-uk/logger');

function noOp() {}

function makeLogger(config) {
  const { kind } = config.logger;
  if (kind === 'mock') {
    return {
      debug: noOp,
      info : noOp,
      warn : noOp,
      error: noOp,
    };
  }
  return newLogger(config.logger);
}

module.exports = {
  makeLogger,
};
