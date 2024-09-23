import * as React from 'react';
import { useEffect } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import { home, isDir, isReadable } from 'src/app/js/fs';

export default function WorkingDirectorySelector({
  currentWorkingDir,
  onSelection
}) {
  const [value, setValue] = React.useState(currentWorkingDir);
  const [helperText, setHelperText] = React.useState('');

  useEffect(() => {
    if (value) {
      (async () => {
        if (!(await isDir(value))) {
          setHelperText("'" + value + "' is not a Directory");
          return;
        }
        if (!(await isReadable(value))) {
          setHelperText("Directory '" + value + "' is not Readable");
          return;
        }
        if (!(await isDir(value + '/posts'))) {
          setHelperText("'posts' Sub Directory does not exist");
          return;
        }
        setHelperText('');
      })();
      return;
    }
    (async () => {
      setValue(await home());
    })();
  }, [value]);

  function handleEntering() {}
  function handleSelection() {
    if (!helperText) {
      onSelection(value);
    }
  }

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      TransitionProps={{ onEntering: handleEntering }}
      open={true}
      keepMounted
    >
      <DialogTitle>Working Directory</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <TextField
              error={Boolean(helperText) || false}
              label={'Path'}
              value={value}
              helperText={helperText || ''}
              fullWidth={true}
              onChange={(e) => setValue(e.target.value)}
            ></TextField>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSelection}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}
