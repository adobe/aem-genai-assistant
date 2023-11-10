const wretch = require('wretch');
const {retry} = require('wretch/middlewares/retry');

function wretchRetry(url) {
  return wretch(url)
    .middlewares([retry({
      retryOnNetworkError: true,
      until: (response) => response && (response.ok || (response.status >= 400 && response.status < 500))
    })]);
}

module.exports = {wretchRetry};
