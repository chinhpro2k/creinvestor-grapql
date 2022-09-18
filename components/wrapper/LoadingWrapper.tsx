import React from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import useTrans from '@hooks/useTrans';
interface ILoadingWrapper {
  queryStatus: any;
  children?: React.ReactNode;
}

const LoadingWrapper: React.FC<ILoadingWrapper> = ({
  children,
  queryStatus: { loading, error },
}) => {
  const trans = useTrans();

  return (
    <>
      {!loading && error && (
        <Alert severity="error">{trans.common['fetchError']}</Alert>
      )}

      {loading && (
        <Box
          sx={{ position: 'relative' }}
          style={{ left: '48%', top: '40%', position: 'absolute' }}
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && !error && <>{children}</>}
    </>
  );
};

export default LoadingWrapper;
