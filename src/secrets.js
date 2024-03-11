const { config } = require('dotenv');
const { expand } = require('dotenv-expand');
const { existsSync } = require('fs');
const { join } = require('path');

// NOTE: side-effect on dest
function mergeObject(src = {}, dest = process.env) {
  const srcIsObject = src && (typeof src === 'object') && !Array.isArray(src);
  if (srcIsObject) {
    for (const [k, v] of Object.entries(src)) {
      // eslint-disable-next-line no-param-reassign
      dest[k] = v;
    }
  }
  return dest;
}

// NOTE: side-effect on dest
function readJsonFile(file, dest = process.env) {
  try {
    if (existsSync(file)) {
      const srcObj = require(file);
      mergeObject(srcObj, dest);
    } else {
      // console.warn(`File not found: ${file}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Failed to read JSON file: ${file} - ${msg}`);
  }
}

// NOTE: side-effect on process.env
function readSecrets() {
  try {
    // added this line to read default environment settings which overrides process.env
    config({ path: join(__dirname, '..', '_defaults.env'), override: true });

    readJsonFile(join(__dirname, '..', '_sharedSecrets.json'));

    readJsonFile(join(__dirname, '..', '_secrets.json'));

    // parse .env if it exists on local dev machine
    if (existsSync(join(__dirname, '..', '.env'))) config({ path: join(__dirname, '..', '.env'), override: true });

    // process placeholders/refs of env variables e.g. RMQ2_PASSWORD="${RMQ1_PASSWORD}"
    const finalObj = expand({ parsed: process.env }).parsed || {};

    mergeObject(finalObj);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to load secrets: ', msg);
  }
}

module.exports = {
  mergeObject,
  readJsonFile,
  readSecrets,
};
