'use client';
import { readFile } from 'src/app/js/fs';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

export default function Editor({ workingDir, currentFile }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!content) {
      (async () => {
        const result = await readFile(currentFile);
        console.log(currentFile, result);
        setContent(result);
      })();
    }
  }, [content, currentFile]);

  function onChange(e) {
    setContent(e.target.value);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignContent: 'center'
      }}
    >
      <Box>
        Working Dir: {workingDir} <br />
        Current File: {currentFile.replace(workingDir, '')} <br />
        <br />
      </Box>
      <Box sx={{ flex: '1', overflow: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            columnGap: '9px'
          }}
        >
          <Box sx={{ flex: '1' }}></Box>
          <Box sx={{ flex: '3' }}>
            <TextField
              multiline
              onChange={onChange}
              sx={{ width: '100%' }}
              value={content}
            />
          </Box>
          <Box sx={{ flex: '3', overflow: 'auto' }}>
            <Markdown>{content}</Markdown>
          </Box>
        </Box>
      </Box>
      <Box>
        <h2>Footer</h2>
        <br />
      </Box>
    </Box>
  );
}
