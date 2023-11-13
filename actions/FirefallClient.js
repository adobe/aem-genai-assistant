const {wretchRetry} = require ('./Network');

class FirefallClient {
  constructor(endpoint, apiKey, org, accessToken) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.org = org;
    this.accessToken = accessToken;
  }

  async completion(prompt, temperature = 0.0, model = 'gpt-4') {
    return await wretchRetry(this.endpoint + '/v1/completions')
      .headers({
        'x-gw-ims-org-id': this.org,
        'x-api-key': this.apiKey,
        'Authorization': `Bearer ${this.accessToken}`,
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

  async feedback(queryId, sentiment) {
    try {
      return await wretchRetry(this.endpoint + '/v1/feedback')
        .headers({
          'Authorization': `Bearer ${this.accessToken}`,
          'x-api-key': this.apiKey,
          'x-gw-ims-org-id': this.org,
          'Content-Type': 'application/json'
        })
        .post({
          query_id: queryId,
          feedback: {
            overall: sentiment ? 'thumbs_up' : 'thumbs_down'
          }
        })
        .json();
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
  }
}

module.exports = {FirefallClient};
