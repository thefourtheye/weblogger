import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import { duration } from '@mui/material';

function getMessage(msg, err) {
  const message = msg || 'Nothing to show here!';
  const causes = getAllCauses(err);
  if (causes.length === 0) {
    return message;
  }
  return causes.reduce((acc, c, idx) => {
    const indent = ' '.repeat((idx + 1) * 4);
    return `${acc}\n${indent}|-> because of "${c}"`;
  }, message);
}

function getAllCauses(err) {
  function getCauses(e, result) {
    if (!e) {
      return result;
    }
    result.push(`${e}`);
    return getCauses(e.cause, result);
  }

  return getCauses(err, []);
}

export function SnackBar({
  duration = 3000,
  severity,
  msg,
  open,
  hideSnackBar,
  snackBarError
}) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      autoHideDuration={duration}
      onClose={hideSnackBar}
    >
      <Alert
        onClose={hideSnackBar}
        severity={severity}
        sx={{ width: '100%' }}
      >
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {getMessage(msg, snackBarError)}
        </pre>
      </Alert>
    </Snackbar>
  );
}

export function useSnackBar() {
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
  const [snackBarAutoHideDuration, setSnackBarAutoHideDuration] = useState(900);
  const [snackBarSeverity, setSnackBarSeverity] = useState('info');
  const [snackBarMsg, setSnackBarMsg] = useState('');
  const [snackBarError, setSnackBarError] = useState();

  function showSnackBar({ duration = 3000, severity, msg, error }) {
    setIsSnackBarOpen(true);
    setSnackBarAutoHideDuration(duration);
    setSnackBarSeverity(severity || (error ? 'error' : 'info'));
    setSnackBarMsg(msg);
    setSnackBarError(error);
  }

  return {
    isSnackBarOpen,
    snackBarAutoHideDuration,
    snackBarSeverity,
    snackBarMsg,
    snackBarError,
    showSnackBar,
    hideSnackBar: () => setIsSnackBarOpen(false)
  };
}
