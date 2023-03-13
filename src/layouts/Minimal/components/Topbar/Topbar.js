import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Hidden from '@material-ui/core/Hidden';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Logo from 'assets/images/moh.png'

const useStyles = makeStyles(() => ({
  root: {
    boxShadow: 'none'
  },
  back2DHISlink: {
	color: "white",
	textAlign: "right",
	float: "right"
  }
}));

const Topbar = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
      color="primary"
      position="fixed"
    >
      <Toolbar>
			<Grid container direction="row" justify="space-between" alignItems="center">
				<Grid item xs>
					<RouterLink to="/">
						<h3 className="fcwhite">
							<img src={Logo} className="mainlogo max-h-50-px m-r-5"/> 
							<Hidden smDown>Health Commodities Dashboard</Hidden>
							&nbsp;
						</h3>
					</RouterLink>
				</Grid>
				{/* <Grid item xs>
					<Button variant="contained" disableElevation color="secondary" href={window.location.pathname+'#/dashboard'} className={"fcwhite", classes.back2DHISlink}>&larr; Back to Main dashboard</Button>
				</Grid> */}
				<Grid item xs className="text-center">
					<Button variant="text" href={window.location.origin} className={"fcwhite", classes.back2DHISlink}>&larr; Back to DHIS2</Button>
				</Grid>
			</Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
