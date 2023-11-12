const {wretchRetry} = require('./Network');
// const FormDataAddon = require('wretch/addons/formData');
const FormUrlAddon = require('wretch/addons/formUrl');

class ImsClient {
  constructor(endpoint, clientId, clientSecret, permAuthCode) {
    this.endpoint = endpoint;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.permAuthCode = permAuthCode;
  }

  async getServiceToken() {
    const json = await wretchRetry(this.endpoint + '/ims/token/v1')
      .addon(FormUrlAddon).formUrl({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: this.permAuthCode,
        grant_type: 'authorization_code',
        scope: 'openid,AdobeID,read_organizations',
      })
      .post()
      .json();

    return json['access_token'];
  }
}

module.exports = {ImsClient};
