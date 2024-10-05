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
import Yaml from 'yaml';

export default function Editor({ workingDir, currentFile }) {
  const [post, setPost] = useState({
    tags: [],
    post: '',
    createdAt: 0,
    modifiedAt: 0
  });
  const [buffer, setBuffer] = useState(post.post);
  const [preview, setPreview] = useState(false);
  const [tags, setTags] = useState(post.tags);
  const {
    isSnackBarOpen,
    snackBarMsg,
    snackBarSeverity,
    snackBarError,
    hideSnackBar,
    showSnackBar
  } = useSnackBar();
  const [hasChanges, setHasChanges] = useState(false);

  function saveInFile() {
    const updatedPost = {
      tags,
      post: buffer,
      modifiedAt: Date.now(),
      createdAt: post.createdAt || Date.now()
    };
    (async () => {
      try {
        await callApi({
          path: currentFile,
          data: Yaml.stringify(updatedPost),
          method: 'POST',
          api: 'writeFile'
        })
          .then(() => {
            setPost(updatedPost);
            setTags(tags);
          })
          .catch((err) => {
            showSnackBar({
              msg: `Writing [${updatedPost}] to File ${currentFile} Failed`,
              error: err
            });
          });
      } catch (err) {
        showSnackBar({
          msg: `Failed Writing [${updatedPost}] to File ${currentFile}`,
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
        return saveInFile();
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
  }, [buffer, preview, tags]);

  useEffect(() => {
    (async () => {
      const fileContents = await callApi({
        path: currentFile,
        api: 'readFile'
      });
      const readPost = fileContents
        ? Yaml.parse(fileContents)
        : {
            post: '',
            createdAt: 0,
            modifiedAt: 0,
            tags: []
          };
      setPost(readPost);
      setBuffer(readPost.post);
      setTags(readPost.tags);
    })();
  }, [currentFile]);

  function areTagsSame(arr1, arr2) {
    console.log(arr1, arr2);
    if (arr1.length !== arr2.length) {
      return false;
    }
    const a1 = [...arr1].sort();
    const a2 = [...arr2].sort();
    for (let i = 0; i < arr2.length; i++) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
    return true;
  }

  function onChange(e) {
    const currentValue = e.target.value;
    setHasChanges(currentValue !== post.post);
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
            onChange={(e, values) => {
              // TODO Refactor this to be a separate function
              setHasChanges(!areTagsSame(post.tags, values));
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
