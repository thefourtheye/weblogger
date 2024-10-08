export async function callApi({ data, api, method, ...args }) {
  const pathParams = Object.entries(args)
    .map(([key, value]) => {
      return key + '=' + value;
    })
    .join('&');
  const apiPath = `/api/fs/${api}?${pathParams}`;
  const chosenMethod = (method || 'GET').toUpperCase();
  try {
    return await fetch(apiPath, {
      method: chosenMethod,
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
        throw Error(`${chosenMethod} call to ${apiPath} Failed`, {
          cause: res.result
        });
      });
  } catch (err) {
    const error = Error(`Failed to make ${chosenMethod} call to ${apiPath}`, {
      cause: err
    });
    return Promise.reject(error);
  }
}
