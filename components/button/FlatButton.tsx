import * as React from 'react';
import { useTheme } from '@mui/material';
import ButtonProgress from './ButtonProgress';

export const FlatButton = (props: any) => {
  const theme = useTheme();

  return (
    <ButtonProgress
      css={`
        background-color: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
        border-radius: 0;
        text-transform: initial;

        &:active,
        &:hover {
          background-color: ${theme.palette.primary.light};
        }
      `}
      fullWidth
      {...props}
    />
  );
};
