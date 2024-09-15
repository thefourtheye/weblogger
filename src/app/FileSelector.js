import { useEffect, useState } from 'react';
import { list } from 'src/app/js/fs';
import FileBrowser from '@/app/FileBrowser';

export default function FileSelector({
  currentFile,
  workingDir,
  onSelection,
  shouldChooseFile
}) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    (async () => {
      setFiles(await list(workingDir));
    })();
  }, [workingDir]);

  return (
    <FileBrowser
      shouldChooseFile={shouldChooseFile}
      currentFile={currentFile}
      workingDir={workingDir}
      files={files}
      onSelection={onSelection}
    ></FileBrowser>
  );
}
