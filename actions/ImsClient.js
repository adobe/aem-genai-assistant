const {wretchRetry} = require('./Network');
const FormDataAddon = require('wretch/addons/formData');

class ImsClient {
  constructor(endpoint, clientId, clientSecret) {
    this.endpoint = endpoint;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getAccessToken() {
    const json = await wretchRetry(this.endpoint + '/ims/token/v2')
      .addon(FormDataAddon).formData({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        scope: 'openid,AdobeID,read_organizations',
      })
      .post()
      .json();

    return json['access_token'];
  }
}

module.exports = {ImsClient};
