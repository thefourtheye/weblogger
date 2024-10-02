import { useEffect, useState } from 'react';
import { callApi } from 'src/app/js/fs';
import FileBrowser from '@/app/FileBrowser';

export default function FileSelector({ currentFile, workingDir, onSelection }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    (async () => {
      setFiles(await callApi({ path: workingDir, api: 'list' }));
    })();
  }, [workingDir]);

  return (
    <FileBrowser
      currentFile={currentFile}
      workingDir={workingDir}
      files={files}
      onSelection={onSelection}
    ></FileBrowser>
  );
}
