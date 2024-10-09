import * as React from 'react';
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { TextField, Typography } from '@mui/material';

import { callApi } from 'src/app/js/fs';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export default function FileCreator({
  workingDir,
  highlightedFile,
  setSelectedFile
}) {
  const [title, setTitle] = React.useState('New Post - ' + getRandomInt(10000));
  const [slugifiedName, setSlugifiedName] = React.useState('');
  const [currentDir, setCurrentDir] = React.useState('');

  useEffect(() => {
    (async function () {
      const dirOfHighlightedFile = await callApi({
        api: 'dirOfFile',
        path: highlightedFile
      });
      setCurrentDir(dirOfHighlightedFile.replace(workingDir, ''));
    })();
  }, [highlightedFile]);

  useEffect(() => {
    (async function () {
      const name = await callApi({
        api: 'slugify',
        value: title
      });
      setSlugifiedName(name);
    })();
  }, [title]);

  function onSubmit() {
    const selectedFilePath = currentDir + '/' + slugifiedName + '.post';
    (async function () {
      const time = Date.now();
      await callApi({
        api: 'writePost',
        path: workingDir + selectedFilePath,
        method: 'POST',
        data: {
          title,
          post: '## Please Start Here',
          tags: ['General'],
          createdAt: time,
          modifiedAt: time
        }
      });
      setSelectedFile({
        filePath: selectedFilePath,
        title
      });
    })();
  }

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '100%' } }}
      maxWidth="md"
      open={true}
      keepMounted
    >
      <DialogTitle>File Creator</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
              Working Directory
              <Box sx={{ fontFamily: 'monospace', margin: 1 }}>
                {workingDir}
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
              Current Directory
              <Box sx={{ fontFamily: 'monospace', margin: 1 }}>
                {currentDir}
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
              Post Title
              <Box sx={{ fontFamily: 'monospace', padding: 1 }}>
                <TextField
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                ></TextField>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
              File Name
              <Box sx={{ fontFamily: 'monospace', margin: 1 }}>
                {workingDir + currentDir + '/' + slugifiedName + '.post'}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSubmit}>Open</Button>
        <Button onClick={() => setSelectedFile({ filePath: highlightedFile })}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
