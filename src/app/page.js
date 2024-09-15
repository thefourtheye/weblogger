'use client';
import { useEffect, useState } from 'react';
import WorkingDirectorySelector from '@/app/WorkingDirectorySelector';
import FileSelector from '@/app/FileSelector';
import Editor from '@/app/Editor';

export default function Home() {
  const [workingDir, setWorkingDirActually] = useState('');
  const [currentFile, setCurrentFileActually] = useState('');
  const [shouldChooseFile, setShouldChooseFile] = useState(false);

  function setCurrentFile(file) {
    setCurrentFileActually(file);
    setShouldChooseFile(false);
  }

  function setWorkingDir(dir) {
    setWorkingDirActually(dir.replace(/\/*$/, '') + '/');
  }

  // useEffect(() => {
  //   if (shouldChooseFile) {
  //     setShouldChooseFile(false);
  //   }
  // }, [shouldChooseFile]);

  useEffect(() => {
    if (currentFile) {
      localStorage.setItem('currentFile', currentFile);
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

  useEffect(() => {
    /** @param {KeyboardEvent} [e] */
    function handleKeyDown(e) {
      console.log(e);
      if (e.ctrlKey && e.key === 'o') {
        setShouldChooseFile(true);
        return;
      }
      if (e.key === "Escape") {
        setShouldChooseFile(false);
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    (!workingDir && (
      <WorkingDirectorySelector
        onSelection={setWorkingDir}
      ></WorkingDirectorySelector>
    )) ||
    ((!currentFile || shouldChooseFile) && (
      <FileSelector
        currentFile={currentFile}
        workingDir={workingDir}
        onSelection={setCurrentFile}
        shouldChooseFile={shouldChooseFile}
      ></FileSelector>
    )) || (
      <Editor
        workingDir={workingDir}
        currentFile={currentFile}
      ></Editor>
    )
  );
}
