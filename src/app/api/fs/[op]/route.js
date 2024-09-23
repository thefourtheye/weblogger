import { access, readdir, readFile, stat } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import logger from '@/app/api/commons/logger';

export async function GET(request, { params }) {
  const reqId = uuidv4();
  const op = params.op;
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  async function handleSyncResponse(ctx, fn) {
    try {
      return Response.json({
        ...ctx,
        status: 'SUCCESS',
        result: fn()
      });
    } catch (err) {
      return Response.json({
        ...ctx,
        status: 'FAILURE',
        result: err
      });
    }
  }

  async function handleAsyncResponse(ctx, fn) {
    try {
      return Response.json({
        ...ctx,
        status: 'SUCCESS',
        result: await fn(ctx.payload.path)
      });
    } catch (err) {
      return Response.json({
        ...ctx,
        status: 'FAILURE',
        result: err
      });
    }
  }

  const ctx = { reqId, op, payload: { path } };
  try {
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
        throw new Error('Unknown FS Operation [' + op + ']');
    }
  } catch (e) {
    const resp = { ...ctx, error: e, status: 'FAILURE' };
    logger.error(resp);
    return Response.json(resp, { status: 500 });
  }
}

async function isReadable(path) {
  try {
    await access(path, fs.constants.R_OK);
    return true;
  } catch (e) {
    logger.error({ error: e, path, op: 'isReadable' });
    return false;
  }
}

async function exists(path) {
  try {
    await access(path, fs.constants.R_OK);
    return true;
  } catch (e) {
    logger.error({ error: e, path, op: 'isReadable' });
    return false;
  }
}

async function isWritable(path) {
  try {
    await access(path, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (e) {
    logger.error({ error: e, path, op: 'isWritable' });
    return false;
  }
}

async function getStat(path) {
  try {
    return await stat(path);
  } catch (e) {
    logger.error({ error: e, path, op: 'stat' });
    return false;
  }
}

async function isDir(path) {
  try {
    return (await getStat(path)).isDirectory();
  } catch (e) {
    logger.error({ error: e, path, op: 'isDir' });
    return false;
  }
}

async function isFile(path) {
  try {
    return (await getStat(path)).isFile();
  } catch (e) {
    logger.error({ error: e, path, op: 'isFile' });
    return false;
  }
}

async function listDir(path) {
  try {
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
  } catch (e) {
    logger.error({ error: e, path, op: 'listDir' });
    throw Error(
      'Failed to List Directory [' + path + '] because of [' + e + ']'
    );
  }
}

async function read(path) {
  try {
    return await readFile(path, { encoding: 'utf8' });
  } catch (e) {
    logger.error({ error: e, path, op: 'read' });
    return false;
  }
}
