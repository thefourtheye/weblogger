'use client';
import { callApi } from 'src/app/js/fs';
import Box from '@mui/material/Box';
import { TextField, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AppBar from '@mui/material/AppBar';
import SnackBar from './SnackBar';

export default function Editor({
  workingDir,
  currentFile,
  setShouldChooseDir,
  setShouldChooseFile
}) {
  const [content, setContent] = useState('');
  const [buffer, setBuffer] = useState(content);
  const [alert, setAlert] = useState({ severity: '', msg: '' });

  function saveBufferToFile() {
    (async () => {
      setAlert({
        msg: `Writing ${buffer} to File ${currentFile}`,
        severity: 'info'
      });
      try {
        await callApi({
          path: currentFile,
          data: buffer,
          method: 'POST'
        })
          .then(setContent)
          .catch((err) => {
            setAlert({
              msg: `Failed Writing to File ${currentFile}. Error: [${err} - ${err.message}]`,
              severity: 'error'
            });
          });
      } catch (err) {
        console.log('saveBufferToFile Err Handler', err);
        setAlert({
          msg: `Failed Writing to File ${currentFile}. Error: [${err} - ${err.message}]`,
          severity: 'error'
        });
      }
    })();
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (!e.ctrlKey || e.key !== 's') {
        return;
      }
      saveBufferToFile();
    }

    document.addEventListener('keydown', handleKeyDown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, []);

  useEffect(() => {
    setAlert({
      msg: `Current Content [${content}]. Reading From ${currentFile}`,
      severity: 'info'
    });
    (async () => {
      const result = await callApi({ path: currentFile, api: 'readFile' });
      setAlert({
        msg: `Read Content [${content}] From ${currentFile}`,
        severity: 'info'
      });
      setContent(result);
      setBuffer(result);
    })();
  }, [currentFile]);

  function onChange(e) {
    setBuffer(e.target.value);
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignContent: 'center',
          rowGap: '15px'
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', rowGap: '10px' }}
            >
              <h2>
                <code>{workingDir}</code>
                <code>{currentFile.replace(workingDir, '')}</code>
              </h2>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: '1', overflow: 'auto', padding: '6px' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              columnGap: '15px'
            }}
          >
            <Box sx={{ flex: '3', overflow: 'auto' }}>
              <TextField
                multiline
                onChange={onChange}
                sx={{ width: '100%', height: '100%' }}
                value={buffer}
              />
            </Box>
            <Box sx={{ flex: '3', overflow: 'auto' }}>
              <Markdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {buffer}
              </Markdown>
            </Box>
          </Box>
        </Box>
        <Box>
          <h2>Footer</h2>
        </Box>
      </Box>
      <SnackBar
        msg={alert.msg}
        severity={alert.severity}
        open={!!alert.msg}
      ></SnackBar>
    </>
  );
}
