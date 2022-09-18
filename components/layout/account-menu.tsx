import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import { useRouter } from 'next/router';
import useTrans from '@hooks/useTrans';
import { Auth, User } from '@utils/auth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useQuery } from '@apollo/client';
import { GET_USER_DETAILS } from '@graphql/user-query';
import { parseJwt } from '@utils/common';

const ButtonRoot = styled(Button)`
  float: right;
  background: none;
  height: 48px;
  display: flex;
  padding: 12px;
  position: relative;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  text-align: right;
  letter-spacing: 0.75px;
  text-transform: uppercase;
  color: #333E48;
  :hover {
    background: none;
  }
  svg {
    color: #000;
    padding-left: 8px;
  }
}`;

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const AvatarSquare = styled(Avatar)`
  border-radius: 50%;
  height: 36px;
  width: 36px;
  position: absolute;
  top: 6px;
  right: 14px;
  border: 1px solid rgb(47, 80, 217);
  img {
    object-fit: contain;
  }
`;

const auth = new Auth();

export default function AccountMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [user] = React.useState<User>(auth.getUser());
  const [userShortName, setUserShortName] = React.useState('');

  const decodedUserInfo = parseJwt(user.token);
  const userInfoQuery = useQuery(GET_USER_DETAILS, {
    variables: {
      id: decodedUserInfo.sub,
    },
  });

  React.useEffect(() => {
    if (userInfoQuery?.data) {
      const userInfo = userInfoQuery.data?.users[0];
      if (userInfo) {
        setUserShortName(
          userInfo.first_name ? userInfo.first_name.substring(0, 49) : ''
        );
      }
    }
  }, [userInfoQuery]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    if (user) {
      auth.signOut();
      router.push('/home');
    }
  };
  const handleDashboard = () => {
    handleClose();
    if (user) {
      router.push('/overview');
    }
  };
  const handleSetting = () => {
    if (user) {
      router.push('/setting');
    }
  };
  const trans = useTrans();

  return (
    <div>
      <ButtonRoot
        id="account-menu"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        style={{ fontSize: '16px' }}
      >
        {userShortName}
        <KeyboardArrowDownIcon
          fontSize="inherit"
          style={{ fontSize: '30px' }}
        />
      </ButtonRoot>

      <StyledMenu
        id="language-menu"
        MenuListProps={{
          'aria-labelledby': 'account-menu',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleDashboard} disableRipple>
          {trans.common['dashboard']}
        </MenuItem>
        <MenuItem onClick={handleSetting} disableRipple>
          {trans.common['settings']}
        </MenuItem>
        <MenuItem onClick={handleLogout} disableRipple>
          {trans.common['logOut']}
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
