'use client';
import { readFile } from 'src/app/js/fs';
import Box from '@mui/material/Box';
import { TextField, Toolbar } from '@mui/material';
import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/FilePresent';
import AppBar from '@mui/material/AppBar';

export default function Editor({
  workingDir,
  currentFile,
  setShouldChooseDir,
  setShouldChooseFile
}) {
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
        alignContent: 'center',
        rowGap: '15px'
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Chip
            label={workingDir}
            onClick={() => setShouldChooseDir(true)}
            icon={<FolderIcon />}
          >
            Hello
          </Chip>
          <Chip
            label={currentFile.replace(workingDir, '')}
            onClick={() => setShouldChooseFile(true)}
            icon={<FileIcon />}
          />
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
              value={content}
            />
          </Box>
          <Box sx={{ flex: '3', overflow: 'auto' }}>
            <Markdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {content}
            </Markdown>
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
