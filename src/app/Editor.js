'use client';
import { readFile, writeFile } from 'src/app/js/fs';
import Box from '@mui/material/Box';
import { TextField, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AppBar from '@mui/material/AppBar';

export default function Editor({
  workingDir,
  currentFile,
  setShouldChooseDir,
  setShouldChooseFile
}) {
  const [content, setContent] = useState('');
  const [buffer, setBuffer] = useState(content);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!e.ctrlKey || e.key !== 's') {
        return;
      }
      (async () => {
        console.log(`Writing ${buffer} to File ${currentFile}`);
        const response = await writeFile(currentFile, buffer);
        if (response.success) {
          setContent(buffer);
        } else {
        }
      })();
    }

    document.addEventListener('keydown', handleKeyDown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [buffer, currentFile]);

  useEffect(() => {
    if (!content) {
      (async () => {
        const result = await readFile(currentFile);
        setContent(result);
      })();
    }
  }, [content, currentFile]);

  function onChange(e) {
    setBuffer(e.target.value);
  }

  return (
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
  );
}
