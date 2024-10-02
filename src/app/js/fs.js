export async function callApi({ path, data, api, method }) {
  try {
    console.log(`Full API Path is [/api/fs/${api}?path=${path || ''}]`);
    return await fetch(`/api/fs/${api}?path=${path || ''}`, {
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
        throw res.result;
      });
  } catch (err) {
    return Promise.reject(
      `Failed to make API Call [${getFailureString({ path, data, api, method, err })}]`
    );
  }
}

function getFailureString({ path, data, api, method, err }) {
  return JSON.stringify({
    path,
    data,
    api,
    method,
    err: err.toString()
  });
}
