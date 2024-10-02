'use client';
import { useEffect, useState } from 'react';
import WorkingDirectorySelector from '@/app/WorkingDirectorySelector';
import FileSelector from '@/app/FileSelector';
import Editor from '@/app/Editor';

export default function Home() {
  const [workingDir, setWorkingDirActually] = useState('');
  const [currentFile, setCurrentFileActually] = useState('');
  const [shouldChooseFile, setShouldChooseFile] = useState(false);
  const [shouldChooseDir, setShouldChooseDir] = useState(false);

  function setCurrentFile(file) {
    setCurrentFileActually(file);
    setShouldChooseDir(false);
    setShouldChooseFile(false);
  }

  function setWorkingDir(dir) {
    setShouldChooseDir(false);
    setShouldChooseFile(true);
    setWorkingDirActually(dir);
  }

  useEffect(() => {
    if (currentFile) {
      localStorage.setItem('currentFile', currentFile);
      setShouldChooseFile(false);
      return;
    }
    const currentFileFromLocalStorage = localStorage.getItem('currentFile');
    if (currentFileFromLocalStorage) {
      setCurrentFile(currentFileFromLocalStorage);
    }
  }, [currentFile]);

  useEffect(() => {
    if (workingDir) {
      localStorage.setItem('workingDir', workingDir);
      return;
    }
    const workingDirFromLocalStorage = localStorage.getItem('workingDir');
    if (workingDirFromLocalStorage) {
      setWorkingDir(workingDirFromLocalStorage);
    }
  }, [workingDir]);

  function handleKeyDown(e) {
    if (!e.ctrlKey || (e.key !== 'd' && e.key !== 'f')) {
      return;
    }
    setShouldChooseDir(e.key === 'd');
    setShouldChooseFile(e.key === 'f');
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, []);

  return (
    ((!workingDir || shouldChooseDir) && (
      <WorkingDirectorySelector
        currentWorkingDir={workingDir}
        onSelection={setWorkingDir}
      ></WorkingDirectorySelector>
    )) ||
    ((!currentFile || shouldChooseFile) && (
      <FileSelector
        workingDir={workingDir}
        currentFile={currentFile}
        onSelection={setCurrentFile}
      ></FileSelector>
    )) || (
      <Editor
        workingDir={workingDir}
        currentFile={currentFile}
        setShouldChooseDir={setShouldChooseDir}
        setShouldChooseFile={setShouldChooseFile}
      ></Editor>
    )
  );
}
