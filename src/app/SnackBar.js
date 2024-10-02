import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState } from 'react';

export default function SnackBar({ severity, msg }) {
  const [actualMsg, setActualMsg] = useState(msg);
  console.log('SnackBar', { severity, msg, actualMsg });

  function handleClose(event, reason) {
    setActualMsg('');
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={!!actualMsg}
      autoHideDuration={10000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {msg}
      </Alert>
    </Snackbar>
  );
}
