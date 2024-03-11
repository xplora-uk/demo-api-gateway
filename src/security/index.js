const jwtLib = require('jsonwebtoken');
const { makeDate } = require('../utils');

function makeJwtService(config, logger) {

  async function verifyAccessToken(jwt) {
    let success = null, error = null;
    try {
      const result = jwtLib.verify(jwt, config.security.jwtSecret);
      success = {
        user_id   : result.sub || null,
        created_at: makeDate(result.iat),
        expires_at: makeDate(result.exp),
        token_id  : result.at_id || null,
      };
    } catch (err) {
      error = err.message || 'Invalid token';
    }
    logger.info({ msg: 'verifyAccessToken', jwt, success, error });
    return { success, error };
  }

  async function verifyRefreshToken(jwt) {
    let success = null, error = null;
    try {
      const result = jwtLib.verify(jwt, config.security.jwtSecret);
      success = {
        user_id   : result.sub || null,
        created_at: makeDate(result.iat),
        expires_at: makeDate(result.exp),
        token_id  : result.rt_id || null,
      };
    } catch (err) {
      error = err.message || 'Invalid token';
    }
    logger.info({ msg: 'verifyRefreshToken', jwt, success, error });
    return { success, error };
  }

  function verifyAnyToken(jwt) {
    const accessToken = verifyAccessToken(jwt);
    if (accessToken.success) return accessToken;
    const refreshToken = verifyRefreshToken(jwt);
    return refreshToken;
  }

  return {
    verifyAccessToken,
    verifyRefreshToken,
    verifyAnyToken,
  };
}

module.exports = {
  makeJwtService,
};
