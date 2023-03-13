import React, { useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import { programs } from 'hcd-config';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(4)
    },
    content: {
        paddingTop: 150,
        textAlign: 'center'
    },
    card: {
        padding: '15px'
    }
}));

const Landing = ({ history }) => {
    const classes = useStyles();

    const switchProgram = progId => {
        const newActiveProg = programs.filter(pg => pg.id == progId)[0];
        localStorage.setItem('program', progId);
        document.cookie = JSON.stringify({ program: progId });
        // update valid org units
        localStorage.removeItem('validOUs')
        // update valid org units
        history.push('/dashboard');
    };

    const checkIfSet = () => {
        if (
            localStorage.getItem('program') === null ||
            localStorage.getItem('program') === undefined ||
            localStorage.getItem('program') === ''
        ) {
            console.log(`program is NOT set`);
        } else {
            history.push('/dashboard');
        }
    };

    useEffect(() => {
        checkIfSet();
        return () => {
            //cleanup
        };
    }, []);

    return (
        <div className={classes.root}>
            <Grid container justify="center" spacing={4}>
                <Grid item lg={8} xs={12}>
                    <div className={classes.content}>
                        <Typography variant="h3">Pick a program:</Typography>
                        <br />
                        <Grid container spacing={3}>
                            {programs.map((pg, pgix) =>
                                pg.active ? (
                                    <Grid item sm="12" md="4" lg="3" key={pg.id + "_" + pgix + "_" + pg.name}>
                                        <a
                                            href="#"
                                            className={classes.classlink}
                                            onClick={() => {
                                                console.log(`switching to ${pg.name}`);
                                                switchProgram(pg.id);
                                            }}>
                                            <Card>
                                                <CardActionArea className={classes.card}>
                                                    <Typography variant="h4" className={classes.cardlink}>{pg.name}</Typography>
                                                    <br />
                                                    <Typography variant="h5" className="fcgrey-dark-3">({pg.owner})</Typography>
                                                </CardActionArea>
                                            </Card>
                                        </a>
                                    </Grid>
                                ) : (
                                    <Grid item sm="12" md="4" lg="3" key={pg.id + "_" + pgix + "_" + pg.name}>
                                        <Card style={{ cursor: 'not-allowed' }}>
                                            <CardActionArea className={classes.card} style={{ cursor: 'not-allowed' }}>
                                                <Typography style={{ cursor: 'not-allowed' }} variant="h4" className={classes.cardlink + " fcgrey-light-2"}>{pg.name}</Typography>
                                                <br />
                                                <Typography style={{ cursor: 'not-allowed' }} variant="h5" className="fcgrey-light-2">({pg.owner})</Typography>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>)
                            )}
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default Landing;
