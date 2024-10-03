export async function callApi({ path, data, api, method }) {
  const apiPath = `/api/fs/${api}?path=${path || ''}`;
  try {
    return await fetch(apiPath, {
      method: method || 'GET',
      body: data && JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          return res.result;
        }
        const error = Error(`${method} call to ${apiPath} Failed`, {
          cause: res.result
        });
        throw Error(res.result);
      });
  } catch (err) {
    const error = Error(`Failed to make ${method} call to ${apiPath}`, {
      cause: err
    });
    return Promise.reject(error);
  }
}
