import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import LanguagePicker from './language-picker';
import AccountMenu from './account-menu';
import Link from '@mui/material/Link';
import Logo from './logo';
import styles from './layout.module.css';
import { Auth, User } from '@utils/auth';
import React from 'react';

const auth = new Auth();

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(0),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Navbar() {
  const [user, setUser] = React.useState<null | User>(null);
  React.useEffect(() => setUser(auth.getUser()), []);

  return (
    <div
      style={{
        padding: '7px 0',
        margin: '0 -14px 0 0',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid
        container
        spacing={0}
        columns={16}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={8}>
          <Link href={user ? '/overview' : ''} className={styles.linkLogoImg}>
            <Logo alt="RealAdvisor" className={styles.logoImg} />
          </Link>
        </Grid>
        <Grid item xs={8}>
          <Item>
            <LanguagePicker />
            {user && <AccountMenu />}
          </Item>
        </Grid>
      </Grid>
    </div>
  );
}
