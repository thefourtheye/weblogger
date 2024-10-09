'use client';
import { callApi } from 'src/app/js/fs';
import Box from '@mui/material/Box';
import { Autocomplete, Chip, TextField, Toolbar } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import AppBar from '@mui/material/AppBar';
import { SnackBar, useSnackBar } from './SnackBar';
import Yaml from 'yaml';

function formatEpochAsDate(epoch) {
  return new Date(epoch).toString().slice(0, 24);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export default function Editor({
  initialTitle,
  workingDir,
  currentFile,
  setShouldCreateNewFile
}) {
  const [currentFilePath, setCurrentFilePath] = useState(currentFile);
  const [post, setPost] = useState({
    tags: ['General'],
    title: initialTitle || '',
    post: '',
    createdAt: Date.now(),
    modifiedAt: Date.now()
  });
  const [buffer, setBuffer] = useState(post.post);
  const [preview, setPreview] = useState(false);
  const [tags, setTags] = useState(post.tags);
  const [title, setTitle] = useState(post.title);
  const {
    isSnackBarOpen,
    snackBarAutoHideDuration,
    snackBarMsg,
    snackBarSeverity,
    snackBarError,
    hideSnackBar,
    showSnackBar
  } = useSnackBar();
  const [hasChanges, setHasChanges] = useState(false);
  const titleRef = useRef(title);

  titleRef.current = title;

  function saveInFile() {
    return (async () => {
      const updatedPost = {
        tags,
        title,
        post: buffer,
        modifiedAt: Date.now(),
        createdAt: post.createdAt || Date.now()
      };
      try {
        const newFilePath = await callApi({
          method: 'POST',
          api: 'writePost',
          path: currentFilePath,
          data: updatedPost
        });
        if (currentFilePath !== newFilePath) {
          const isFile = await callApi({
            path: currentFilePath,
            api: 'isFile'
          });
          if (isFile) {
            await callApi({
              path: currentFilePath,
              api: 'deleteFile'
            });
          }
          setCurrentFilePath(newFilePath);
          showSnackBar({ msg: 'File renamed and Saved', severity: 'warning' });
        } else {
          setPost(updatedPost);
          showSnackBar({ msg: 'Saved' });
        }
        localStorage.setItem('currentFile', newFilePath);
        setHasChanges(false);
      } catch (err) {
        showSnackBar({
          msg: `Failed Writing [${updatedPost}] to File ${currentFilePath}`,
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
      case 'n':
        return saveInFile().then(() => setShouldCreateNewFile(true));
      default:
        return;
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [currentFilePath, post, buffer, preview, tags, title]);

  useEffect(() => {
    async function fileNameChanger(path, currentTitle) {
      const slugifiedName = await callApi({
        value: currentTitle,
        api: 'slugify'
      });
      const dirOfFile = await callApi({
        path: path,
        api: 'dirOfFile'
      });

      if (currentTitle === titleRef.current) {
        setCurrentFilePath(dirOfFile + '/' + slugifiedName + '.post');
        setHasChanges(true);
      }
    }

    (async function () {
      await debounce(fileNameChanger, 500)(currentFilePath, title);
    })();
  }, [title]);

  useEffect(() => {
    (async () => {
      let fileContents;
      try {
        fileContents = await callApi({
          path: currentFilePath,
          api: 'readFile'
        });
      } catch (e) {}
      const time = new Date().getMilliseconds();
      const readPost = fileContents
        ? Yaml.parse(fileContents)
        : {
            title: title || 'New Post - ' + getRandomInt(10000),
            post: buffer || '',
            createdAt: post.createdAt || time,
            modifiedAt: post.modifiedAt || time,
            tags
          };
      setPost(readPost);
      setBuffer(readPost.post);
      setTags(readPost.tags);
      setTitle(readPost.title);
      setHasChanges(!fileContents);
    })();
  }, [currentFilePath]);

  function areTagsSame(arr1, arr2) {
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
                <code>{currentFilePath.replace(workingDir, '')}</code>
                {hasChanges && '*'}
              </h2>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            border: 0,
            borderColor: 'red',
            padding: 1,
            margin: 0,
            display: 'flex',
            justifyContent: 'space-between',
            justifyItems: 'space-between',
            fluxDirection: 'column'
          }}
        >
          <Box sx={{ flex: '1' }}>
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
                      label={
                        <Box sx={{ fontFamily: 'monospace' }}>{option}</Box>
                      }
                      key={key}
                      {...tagProps}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  required={true}
                  {...params}
                  variant="outlined"
                  label="Tags"
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                border: 0,
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
                Created
                <Box sx={{ fontFamily: 'monospace', margin: 1 }}>
                  {formatEpochAsDate(post.createdAt)}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', border: 0 }}>
                Modified
                <Box sx={{ fontFamily: 'monospace', margin: 1 }}>
                  {formatEpochAsDate(post.modifiedAt)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ border: 0, borderColor: 'red', padding: 1, margin: 0 }}>
          <TextField
            inputProps={{ maxLength: 128 }}
            value={title}
            onChange={(e) => {
              // TODO Refactor this to be a separate function
              setHasChanges(post.title !== e.target.value);
              setTitle(e.target.value);
            }}
            autoFocus={true}
            label={'Title'}
            fullWidth={true}
            required={true}
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
            {/* TODO Rethink how to show preview and editor on larger screens
            together. viewport size guides of MUI perhaps? */}
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
        duration={snackBarAutoHideDuration}
        msg={snackBarMsg}
        severity={snackBarSeverity}
        open={isSnackBarOpen}
        hideSnackBar={hideSnackBar}
        snackBarError={snackBarError}
      ></SnackBar>
    </>
  );
}
