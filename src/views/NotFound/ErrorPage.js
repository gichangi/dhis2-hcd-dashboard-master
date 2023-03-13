import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid  from '@material-ui/core/Grid'; 
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  content: {
    paddingTop: 150,
    textAlign: 'center'
  },
  image: {
    marginTop: 50,
    display: 'inline-block',
    maxWidth: '100%',
    width: 560
  }
}));


const ErrorPage = (props) => {
  const classes = useStyles();
  const hist = useHistory();
  return (
    <div className={classes.root}>
      <Grid
        container
        justify="center"
        spacing={4}
      >
        <Grid
          item
          lg={6}
          xs={12}
        >
          <div className={classes.content}>
            <Typography variant="h1">
              Sorry. Something went wrong here.
            </Typography>
            <Typography variant="subtitle2">
              You either went to an incorrect URL or something broke.
              Whichever it is, try going back
            </Typography>
			<br/>
			<Button variant="contained" disableElevation color="secondary" size="medium" onClick={()=>{hist.goBack()}}>&larr; Go back</Button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default ErrorPage;
