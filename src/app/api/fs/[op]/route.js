import { access, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import logger from '@/app/api/commons/logger';

async function handleSyncResponse(ctx, fn) {
  try {
    return Response.json({
      ctx,
      success: true,
      result: fn()
    });
  } catch (err) {
    return Response.json({
      ctx,
      result: `Operation Failed. Context: [${ctx}], Error: [${err + ' - ' + err.message}]`
    });
  }
}

async function handleAsyncResponse(ctx, fn) {
  try {
    return Response.json({
      ctx,
      success: true,
      result: await fn(ctx.payload)
    });
  } catch (err) {
    return Response.json({
      ctx,
      result: `Operation Failed. Context: [${ctx}], Error: [${err + ' - ' + err.message}]`
    });
  }
}

export async function POST(request, { params }) {
  const reqId = uuidv4();
  const op = params.op;
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const body = await request.json();
  const ctx = { reqId, op, payload: { path, body } };
  console.log(`FS Operation [${op}]`);
  console.log(`Context [${ctx}]`);
  switch (op) {
    case 'writeFile':
      return await handleAsyncResponse(ctx, write);
    default:
      console.log(`Unknown FS Operation [${op}]`);
      return Response.json({
        ctx,
        result: `Unknown FS Operation [${op}]`
      });
  }
}

export async function GET(request, { params }) {
  const reqId = uuidv4();
  const op = params.op;
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  const ctx = { reqId, op, payload: { path } };
  switch (op) {
    case 'home':
      return handleSyncResponse(ctx, () => require('os').homedir());
    case 'isReadable':
      return await handleAsyncResponse(ctx, isReadable);
    case 'isWritable':
      return await handleAsyncResponse(ctx, isWritable);
    case 'isDir':
      return await handleAsyncResponse(ctx, isDir);
    case 'isFile':
      return await handleAsyncResponse(ctx, isFile);
    case 'readFile':
      return await handleAsyncResponse(ctx, read);
    case 'list':
      return await handleAsyncResponse(ctx, listDir);
    default:
      return Response.json({
        ctx,
        result: Error(`Unknown FS Operation [${op}]`)
      });
  }
}

async function isReadable({ path }) {
  await access(path, fs.constants.R_OK);
  return true;
}

async function isWritable({ path }) {
  await access(path, fs.constants.R_OK | fs.constants.W_OK);
  return true;
}

async function getStat({ path }) {
  try {
    return await stat(path);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function isDir({ path }) {
  return (await getStat({ path })).isDirectory();
}

async function isFile({ path }) {
  return (await getStat({ path })).isFile();
}

async function listDir({ path }) {
  const files = await readdir(path, { withFileTypes: true, recursive: true });
  const mappedFiles = files.map((file) => ({
    name: file.name,
    path: file.path,
    parentPath: file.parentPath,
    isDir: file.isDirectory(),
    isFile: file.isFile(),
    isLink: file.isSymbolicLink()
  }));
  const grouping = {};
  mappedFiles.forEach((file) => {
    const currPath = file.parentPath.replace(path, '') || '/';
    const parts = currPath.split('/').filter((value) => value);
    const pathToInsert = parts.reduce((acc, curr) => {
      acc[curr] = acc[curr] || { properties: null, children: {} };
      return acc[curr]['children'];
    }, grouping);
    pathToInsert[file.name] = {
      properties: file,
      children: (pathToInsert[file.name] || {})['children'] || {}
    };
  });
  return grouping;
}

async function read({ path }) {
  return await readFile(path, { encoding: 'utf8' });
}

async function write({ path, body }) {
  return await writeFile(path, body, { encoding: 'utf8' });
}
