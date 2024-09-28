export async function isReadable(path) {
  return await fetch('/api/fs/isReadable?path=' + path)
    .then((res) => res.json())
    .then((res) => res.result);
}

export async function isWritable(path) {
  return await fetch('/api/fs/isWritable?path=' + path)
    .then((res) => res.json())
    .then((res) => res.result);
}

export async function isDir(path) {
  return await fetch('/api/fs/isDir?path=' + path)
    .then((res) => res.json())
    .then((res) => res.result);
}

export async function isFile(path) {
  return await fetch('/api/fs/isFile?path=' + path)
    .then((res) => res.json())
    .then((res) => res.result);
}

export async function readFile(path) {
  return await fetch('/api/fs/readFile?path=' + path)
    .then((res) => res.json())
    .then((res) => res.result);
}

export async function writeFile(path, data) {
  return await fetch('/api/fs/writeFile?path=' + path, {
    method: 'POST',
    body: JSON.stringify(data),
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
}

export async function list(path) {
  return await fetch('/api/fs/list?path=' + path)
    .then((res) => res.json())
    .then((res) => res.result);
}

export async function home() {
  return await fetch('/api/fs/home')
    .then((res) => res.json())
    .then((res) => res.result);
}
