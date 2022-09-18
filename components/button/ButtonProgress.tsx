import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import green from '@mui/material/colors/green';
import Button from '@mui/material/Button';

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
    position: 'relative',
    display: 'inline-block',
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

const ButtonProgress = ({ classes, loading, ...props }) => (
  <div
    className={classes.root}
    css={`
      ${props.fullWidth && `display: flex; flex-grow: 1; margin: 0;`};
    `}
  >
    <Button disabled={loading} {...props} />
    {loading && (
      <CircularProgress size={24} className={classes.buttonProgress} />
    )}
  </div>
);

export default ButtonProgress;
