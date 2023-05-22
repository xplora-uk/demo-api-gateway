const dotenv = require('dotenv');
const { expand } = require('dotenv-expand');

// side-effect on process.env
async function makeEnvSettings() {
  
  // TODO: read _sharedSecrets.json
  // TODO: read _secrets.json
  const result = dotenv.config();

  expand(result);

  return {
    ...process.env,
  };
}

module.exports = { makeEnvSettings };
