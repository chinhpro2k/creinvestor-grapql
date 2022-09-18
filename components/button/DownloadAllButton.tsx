import * as React from 'react';
import styles from '@styles/Deal.module.scss';

export const DownloadAllButton = (props: any) => {
  const { name, ...remainingProps } = props;
  return (
    <button className={styles.but_download_all} {...remainingProps}>
      <em />
      <span>{name}</span>
    </button>
  );
};
