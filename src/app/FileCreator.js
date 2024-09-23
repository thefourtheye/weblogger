import * as React from 'react';
import { useState } from 'react';
import { isFile } from 'src/app/js/fs';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { alpha, styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

export default function FileCreator({
  workingDir,
  selectedDir,
  onCreation,
  onCancel
}) {
  const [dirToCreateFile, setDirToCreateFile] = useState(
    workingDir + '/' + selectedDir
  );

  async function isItemAFile(itemId) {
    return await isFile(itemId);
  }

  async function onItemSelectionToggle(e, itemId, isSelected) {
    if (isSelected && (await isItemAFile(itemId)))
      setSelectedFile(itemId.replace(workingDir, ''));
  }

  function onSubmit(e) {
    if (selectedFile) {
      onSelection(workingDir + selectedFile);
    }
    e.preventDefault();
  }

  function createFile() {}

  function onCancel() {
    onSelection(workingDir + selectedFile);
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
          <Box sx={{ flex: '1 1 auto' }}></Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {selectedFile && (
          <Typography>Selected File is {selectedFile}</Typography>
        )}
        <Button onClick={createFile}>Create Post File</Button>
        <Button onClick={onSubmit}>Open</Button>
        {selectedFile && <Button onClick={onSubmit}>Cancel</Button>}
      </DialogActions>
    </Dialog>
  );
}
