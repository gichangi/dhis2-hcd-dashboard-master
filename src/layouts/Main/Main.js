import React, { useState } from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles'; 
import useTheme from '@material-ui/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { Sidebar, Topbar, Footer } from './components';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 56,
    height: '100%',
    [theme.breakpoints.up('sm')]: {
      paddingTop: 64
    }
  },
  shiftContent: {
    paddingLeft: 240
  },
  content: {
    height: '100%'
  }
}));

const Main = props => {
  const { children } = props;

  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), {
    defaultMatches: true
  });

  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebarOpen = () => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  const shouldOpenSidebar = isDesktop ? true : openSidebar;

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.shiftContent]: isDesktop
      })}
    >
		<Topbar onSidebarOpen={handleSidebarOpen} />
		<Sidebar
			onClose={handleSidebarClose}
			location={props.children.props.location}
			open={shouldOpenSidebar}
			variant={isDesktop ? 'persistent' : 'temporary'}
		/>
      <main className={classes.content}>
        {children}

        <Footer />
      </main>
    </div>
  );
};

export default Main;
