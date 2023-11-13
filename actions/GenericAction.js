function asGenericAction(action) {
  return async function (params) {
    try {
      return {
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
        body: await action(params)
      };
    } catch (e) {
      return {
        headers: {'Content-Type': 'application/json'},
        statusCode: e.status ?? 500,
        body: {
          error: e.message ?? 'Internal Server Error',
        }
      };
    }
  }
}

module.exports = {asGenericAction};
