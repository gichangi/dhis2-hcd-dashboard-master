import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Footer = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Typography variant="body1">
        &copy;{' '}
        <Link component="a" href="https://healthit.uonbi.ac.ke/" target="_blank" > USAID HealthIT </Link>
        &middot; {new Date().getFullYear()}
        &nbsp; &nbsp; &nbsp;
        <Link component="a" href="https://health.go.ke/" target="_blank" > Ministry of Health </Link>
        &nbsp; &nbsp; &nbsp;
        <Link component="a" href="https://heiskenya.org/" target="_blank" > KHIS </Link>
      </Typography>
    </div>
  );
};
export default Footer;
