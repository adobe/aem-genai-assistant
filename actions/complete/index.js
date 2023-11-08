const wretch = require('wretch');
const FormDataAddon = require('wretch/addons/formData');
const {retry} = require('wretch/middlewares/retry');

function wretchRetry(url) {
  return wretch(url).middlewares([retry({
    retryOnNetworkError: true,
  })]);
}

async function getAccessToken(params) {
  const endpoint = params['IMS_ENDPOINT']
  const clientId = params['IMS_CLIENT_ID']
  const clientSecret = params['IMS_CLIENT_SECRET']

  const json = await wretchRetry(endpoint + '/ims/token/v2')
    .addon(FormDataAddon).formData({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'openid,AdobeID,read_organizations',
    })
    .post()
    .json();

  return json['access_token'];
}

async function completion(params, accessToken, prompt, model, temperature) {
  const endpoint = params['FIREFALL_ENDPOINT']
  const apiKey = params['FIREFALL_API_KEY']
  const org = params['FIREFALL_IMS_ORG']

  return await wretchRetry(endpoint + '/v1/completions')
    .headers({
      'x-gw-ims-org-id': org,
      'x-api-key': apiKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    })
    .post({
      dialogue: {
        question: prompt
      },
      llm_metadata: {
        llm_type: 'azure_chat_openai',
        model_name: model,
        temperature: temperature,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1
      }
    })
    .json();
}

async function main (params) {
  try {
    const accessToken = await getAccessToken(params);
    const prompt = params['prompt'] || 'Who are you?';
    const model = params['model'] || 'gpt-4';
    const temperature = params['t'] || 0.0;
    const json = await completion(params, accessToken, prompt, model, temperature);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: json
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: e.message
      }
    };
  }
}

exports.main = main
