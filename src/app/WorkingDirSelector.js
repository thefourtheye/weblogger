'use client';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

export default function WorkingDirSelector({ setter }) {
  const fileUploader = useRef(null);
  useEffect(() => {
    fileUploader.current.click();
  });
  return (
    <center>
      <h3>Select Working Directory</h3>
      <input
        ref={fileUploader}
        type={'file'}
        accept="*/*"
        onChange={(event) => {
          setter(event.target.value);
        }}
        onClick={(event) => {
          event.target.value = null;
        }}
      />
    </center>
  );
}
