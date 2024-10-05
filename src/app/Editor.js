'use client';
import { callApi } from 'src/app/js/fs';
import Box from '@mui/material/Box';
import { Autocomplete, Chip, TextField, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AppBar from '@mui/material/AppBar';
import { SnackBar, useSnackBar } from './SnackBar';

export default function Editor({ workingDir, currentFile }) {
  const [content, setContent] = useState('');
  const [buffer, setBuffer] = useState(content);
  const [preview, setPreview] = useState(false);
  const [tags, setTags] = useState([]);
  const {
    isSnackBarOpen,
    snackBarMsg,
    snackBarSeverity,
    snackBarError,
    hideSnackBar,
    showSnackBar
  } = useSnackBar();
  const [hasChanges, setHasChanges] = useState(false);

  function saveBufferToFile(buffer) {
    (async () => {
      try {
        await callApi({
          path: currentFile,
          data: buffer,
          method: 'POST',
          api: 'writeFile'
        })
          .then(() => setContent(buffer))
          .catch((err) => {
            showSnackBar({
              msg: `Writing [${buffer}] to File ${currentFile} Failed`,
              error: err
            });
          });
      } catch (err) {
        showSnackBar({
          msg: `Failed Writing [${buffer}] to File ${currentFile}`,
          error: err
        });
      }
    })();
  }

  function handleKeyDown(e) {
    if (!e.ctrlKey) {
      return;
    }
    switch (e.key) {
      case 's':
        return saveBufferToFile(buffer);
      case 't':
        return setPreview(!preview);
      default:
        return;
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [buffer, preview]);

  useEffect(() => {
    (async () => {
      const result = await callApi({ path: currentFile, api: 'readFile' });
      setContent(result);
      setBuffer(result);
    })();
  }, [currentFile]);

  function onChange(e) {
    const currentValue = e.target.value;
    setHasChanges(currentValue !== content);
    setBuffer(currentValue);
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
                {hasChanges && '*'}
              </h2>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ border: 0, borderColor: 'red', padding: 1, margin: 0 }}>
          <Autocomplete
            multiple
            value={tags}
            onChange={(e, values, reason) => {
              setTags([...values]);
            }}
            id="tags-filled"
            options={['Untagged']} // TODO Load Current set of Tags from File
            defaultValue={[]}
            freeSolo
            renderTags={(values, getTagProps) =>
              values.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    variant="filled"
                    label={<Box sx={{ fontFamily: 'monospace' }}>{option}</Box>}
                    key={key}
                    {...tagProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Tags"
              />
            )}
          />
        </Box>
        <Box sx={{ flex: '1', overflow: 'auto', padding: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              columnGap: '15px'
            }}
          >
            {!preview && (
              <Box sx={{ flex: '3', overflow: 'auto' }}>
                <TextField
                  multiline
                  onChange={onChange}
                  sx={{ width: '100%', height: '100%' }}
                  value={buffer}
                />
              </Box>
            )}
            {preview && (
              <Box sx={{ flex: '3', overflow: 'auto' }}>
                <Markdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                >
                  {buffer}
                </Markdown>
              </Box>
            )}
          </Box>
        </Box>
        <Box>
          <h2>Footer</h2>
        </Box>
      </Box>
      <SnackBar
        msg={snackBarMsg}
        severity={snackBarSeverity}
        open={isSnackBarOpen}
        hideSnackBar={hideSnackBar}
        snackBarError={snackBarError}
      ></SnackBar>
    </>
  );
}
