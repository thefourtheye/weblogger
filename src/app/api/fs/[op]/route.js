import {
  access,
  readdir,
  readFile,
  stat,
  writeFile,
  rename,
  unlink
} from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import logger from '@/app/api/commons/logger';
import { dirname } from 'path';
import slugify from 'slugify';
import Yaml from 'yaml';

async function handleSyncResponse(ctx, fn) {
  try {
    return Response.json({
      ctx,
      success: true,
      result: fn(ctx.payload)
    });
  } catch (err) {
    return Response.json({
      ctx,
      result: `Operation Failed. Context: [${JSON.stringify(ctx)}], Error: [${err + ' - ' + err.message}]`
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
      result: `Operation Failed. Context: [${JSON.stringify(ctx)}], Error: [${err + ' - ' + err.message}]`
    });
  }
}

export async function POST(request, { params }) {
  const reqId = uuidv4();
  const op = params.op;
  const body = await request.json();
  const ctx = {
    reqId,
    op,
    payload: { ...Object.fromEntries(request.nextUrl.searchParams), body }
  };
  switch (op) {
    case 'writeFile':
      return await handleAsyncResponse(ctx, write);
    case 'writePost':
      return await handleAsyncResponse(ctx, writePost);
    default:
      return Response.json({
        ctx,
        result: `Unknown FS Operation [${op}]`
      });
  }
}

export async function GET(request, { params }) {
  const reqId = uuidv4();
  const op = params.op;
  const ctx = {
    reqId,
    op,
    payload: { ...Object.fromEntries(request.nextUrl.searchParams) }
  };
  switch (op) {
    case 'home':
      return handleSyncResponse(ctx, () => require('os').homedir());
    case 'slugify':
      return handleSyncResponse(ctx, ({ value }) => _slugify(value));
    case 'dirOfFile':
      return await handleAsyncResponse(ctx, getDirOfFile);
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
    case 'deleteFile':
      return await handleAsyncResponse(ctx, deleteFile);
    case 'list':
      return await handleAsyncResponse(ctx, listDir);
    case 'rename':
      return await handleAsyncResponse(ctx, renameFile);
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
  try {
    return (await getStat({ path })).isDirectory();
  } catch (err) {
    return Promise.resolve(false);
  }
}

async function isFile({ path }) {
  try {
    return (await getStat({ path })).isFile();
  } catch (err) {
    return Promise.resolve(false);
  }
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

async function writePost({ path, body }) {
  const pathWithoutFileName = dirname(path);
  const fileName = _slugify(body.title) + '.post';
  const yamilifiedBody = Yaml.stringify(body);
  await writeFile(pathWithoutFileName + '/' + fileName, yamilifiedBody, {
    encoding: 'utf8',
    flush: true
  });
  return pathWithoutFileName + '/' + fileName;
}

async function renameFile({ oldPath, newPath }) {
  return await rename(oldPath, newPath);
}

async function deleteFile({ path }) {
  return await unlink(path);
}

async function getDirOfFile({ path }) {
  if (await isDir({ path })) {
    return path;
  }
  return dirname(path);
}

function _slugify(title) {
  return slugify(title);
}
