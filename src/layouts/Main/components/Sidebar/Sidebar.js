import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';
import Divider from '@material-ui/core/Divider'; 
import Drawer from '@material-ui/core/Drawer';
import Link from '@material-ui/core/Link';
import { SidebarNav } from './components';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: 240,
    [theme.breakpoints.up('lg')]: {
      marginTop: 64,
      height: 'calc(100% - 64px)'
    }
  },
  root: {
    backgroundColor: theme.palette.white,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  nav: {
    marginBottom: theme.spacing(2)
  }
}));

const Sidebar = props => {
  const { open, variant, onClose, className, location, ...rest } = props;
  const classes = useStyles();


  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawer }}
      onClose={onClose}
      open={open}
      variant={variant}
    >
      <div {...rest} className={clsx(classes.root, className)} >
        <Link href={window.location.origin}>&larr; Back to DHIS2</Link>
        <Divider className={classes.divider} />
        <SidebarNav
          className={classes.nav}
          location={location}
        />
      </div>
    </Drawer>
  );
};

export default React.memo(Sidebar);
