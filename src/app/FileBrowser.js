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

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0)
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3
    }
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
  }
}));

function slashTrimmer(data) {
  return data.replace(/\/+/g, '/');
}

function createTreeItem(files) {
  return Object.entries(files || {}).map(([key, value]) => {
    const path = slashTrimmer(
      value.properties.parentPath + '/' + value.properties.name
    );
    return (
      <CustomTreeItem
        key={path}
        itemId={path}
        label={value.properties.name}
      >
        {createTreeItem(value['children'] || {})}
      </CustomTreeItem>
    );
  });
}

export default function FileBrowser({
  currentFile,
  workingDir,
  files,
  onSelection
}) {
  const [selectedFile, setSelectedFile] = useState(
    (currentFile || '').replace(workingDir, '')
  );
  const [expandedItems, setExpandedItems] = useState(
    selectedFile
      .split('/')
      .reduce(
        (acc, current) => {
          acc.push(acc[acc.length - 1] + '/' + current);
          return acc;
        },
        [workingDir]
      )
      .map((path) => slashTrimmer(path))
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
  const handleExpandedItemsChange = (event, itemIds) => {
    setExpandedItems(itemIds);
  };
  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '100%' } }}
      maxWidth="md"
      open={true}
      keepMounted
    >
      <DialogTitle>File Selection</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Box sx={{ flex: '1 1 auto' }}>
            <SimpleTreeView
              aria-label="customized"
              slots={{
                expandIcon: FolderOpenIcon,
                collapseIcon: FolderIcon
              }}
              sx={{ overflowX: 'hidden', flexGrow: 1 }}
              selectedItems={[workingDir + selectedFile]}
              expandedItems={expandedItems}
              onExpandedItemsChange={handleExpandedItemsChange}
              onItemSelectionToggle={onItemSelectionToggle}
              defaultValue={''}
            >
              <CustomTreeItem
                itemId={workingDir}
                label={workingDir}
              >
                {createTreeItem(files)}
              </CustomTreeItem>
            </SimpleTreeView>
          </Box>
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
