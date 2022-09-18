import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LanguageIcon from '@mui/icons-material/Language';
import { useRouter } from 'next/router';
import { getLangFlag } from '@utils/getLangFlag';
import Image from 'next/image';

const ButtonRoot = styled(Button)`
  float: right;
  background: none;
  height: 48px;
  width: 48px;
  display: inline-block;
  padding: 12px;
  min-width: 48px;
  border-radius: 50%;
  :hover {
    background-color: rgba(0, 0, 0, 0.08);
    color: rgba(0, 0, 0, 0.54);
    overflow: visible;
    /* transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; */
  }
  em.wrapperFlagIcon {
    position: relative;
    & > span {
      position: absolute !important;
      height: 12px !important;
      width: 20px  !important;
      bottom: 4px;
      right: -8px;
      z-index: 2;
    }
  }
  svg {
    /* fill: currentColor; */
    display: inline-block;
    font-size: 1.5rem;
    /* transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; */
    flex-shrink: 0;
    user-select: none;
    color: #333E48;
  }
  img {
    height: 12px;
    width: 20px;
  }
}
`;

const LangFlagIcon = ({ language }: { language: string }) => (
  <>
    <LanguageIcon viewBox="0 0 24 24" />
    {!!language && false && (
      <Image
        src={getLangFlag(language)}
        alt={language}
        width="20"
        height="12"
        quality={100}
      />
    )}
  </>
);

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
    minWidth: 200,
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
      '& .MuiListItemIcon-root': {
        minWidth: 56,
      },
      '&:active': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
  },
}));

export default function LanguagePicker() {
  const router = useRouter();
  const { pathname, asPath, query, locale = 'en' } = router;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <ButtonRoot
        id="language-picker"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation={true}
        disableRipple={false}
        onClick={handleClick}
      >
        <em className="wrapperFlagIcon">
          <LangFlagIcon language={locale} />
        </em>
      </ButtonRoot>

      <StyledMenu
        id="language-menu"
        MenuListProps={{
          'aria-labelledby': 'language-picker',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            router.push({ pathname, query }, asPath, { locale: 'en' });
          }}
          disableRipple={true}
        >
          <ListItemIcon>
            <Image
              src={getLangFlag('en')}
              alt="en"
              width="32"
              height="16"
              quality={100}
            />
          </ListItemIcon>
          <ListItemText inset primary="English">
            English
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            router.push({ pathname, query }, asPath, { locale: 'de' });
          }}
          disableRipple={true}
        >
          <ListItemIcon>
            <Image
              src={getLangFlag('de')}
              alt="de"
              width="32"
              height="16"
              quality={100}
            />
          </ListItemIcon>
          <ListItemText inset primary="Deutsch">
            Deutsch
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            router.push({ pathname, query }, asPath, { locale: 'fr' });
          }}
          disableRipple={true}
        >
          <ListItemIcon>
            <Image
              src={getLangFlag('fr')}
              alt="fr"
              width="24"
              height="16"
              quality={100}
            />
          </ListItemIcon>
          <ListItemText inset primary="Francais">
            Francais
          </ListItemText>
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
