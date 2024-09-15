import { access, readdir, readFile, stat } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import logger from '@/app/api/commons/logger';

export async function GET(request, { params }) {
  const reqId = uuidv4();
  const op = params.op;
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  const ctx = { reqId, op, payload: { path } };
  try {
    switch (op) {
      case 'home':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: require('os').homedir()
        });
      case 'isReadable':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: await isReadable(path)
        });
      case 'isWritable':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: await isWritable(path)
        });
      case 'isDir':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: await isDir(path)
        });
      case 'isFile':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: await isFile(path)
        });
      case 'readFile':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: await read(path)
        });
      case 'list':
        return Response.json({
          ...ctx,
          status: 'SUCCESS',
          result: await listDir(path)
        });
      default:
        throw new Error('Unknown FS Operation [' + op + ']');
    }
  } catch (e) {
    const resp = { ...ctx, error: e, status: 'FAILED' };
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

async function isWritable(path) {
  try {
    await access(path, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (e) {
    logger.error({ error: e, path, op: 'isWritable' });
    return false;
  }
}

async function isDir(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch (e) {
    logger.error({ error: e, path, op: 'isDir' });
    return false;
  }
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
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
    return [];
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
