const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    return this._jwt.sign(payload, process.env.ACCESS_TOKEN_KEY);
  }

  async createRefreshToken(payload) {
    return this._jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  }

  async verifyRefreshToken(token) {
    try {
      this._jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async verifyAccessToken(token) {
    try {
      this._jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      throw new InvariantError('access token tidak valid');
    }
  }

  async getTokenFromHeader(header) {
    if (!header) {
      throw new AuthenticationError('Missing authentication');
    }
    const token = header.replace(/^Bearer\s+/, '');
    return token;
  }

  async verifyTokenFromHeader(header) {
    if (!header) {
      throw new AuthenticationError('Missing authentication');
    }
    const token = header.replace(/^Bearer\s+/, '');
    await this.verifyAccessToken(token);
    const result = await this.decodePayload(token);
    return result;
  }

  async decodePayload(token) {
    const payload = this._jwt.decode(token);
    if (!payload) {
      throw new AuthenticationError('access token tidak valid');
    }
    return payload;
  }
}

module.exports = JwtTokenManager;
