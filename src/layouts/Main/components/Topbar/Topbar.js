import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useHistory } from 'react-router-dom';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import Typography from '@material-ui/core/Typography'
import Snackbar from '@material-ui/core/Snackbar'
import List from '@material-ui/core/List'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Divider from '@material-ui/core/Divider'

import Autocomplete from '@material-ui/lab/Autocomplete';
import MenuIcon from '@material-ui/icons/Menu';

import CalendarTodayOutlined from '@material-ui/icons/CalendarTodayOutlined'
import PinDropOutlined from '@material-ui/icons/PinDropOutlined'
import Apps from '@material-ui/icons/Apps'
import FolderOpenTwoTone from '@material-ui/icons/FolderOpenTwoTone'
import ArrowForward from '@material-ui/icons/ArrowForward'

import Monthpicker from '@compeon/monthpicker';
import Alert from '@material-ui/lab/Alert';
import { programs } from 'hcd-config';
import { findPeriodRange } from 'common/utils';
import { justFetch } from 'common/utils';
const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const endpts = activProg.endpoints;

const queryString = require('query-string');
const abortRequests = new AbortController();
const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none'
  },
  flexGrow: {
    flexGrow: 1
  },
  flexO: {
    flexGrow: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center'
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  }
}));

const Topbar = props => {
  const { className, onSidebarOpen, history, ...rest } = props;

  const location = useLocation();
  const classes = useStyles();

  const [err, setErr] = useState({ error: false, msg: '' });
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [c_units, setCUnits] = useState([]);

  const histo = useHistory();

  const [notifications] = useState([]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  let [levels, setLevels] = React.useState([
    { level: 1, name: 'Kenya' },
    { level: 2, name: 'County' },
    { level: 3, name: 'Sub-County' },
    { level: 4, name: 'County Assembly Ward' },
    { level: 5, name: 'Health Facility' },
    { level: 6, name: 'Community Unit' },
    // { level: 7, name: 'level 7' },
    // { level: 8, name: 'Level 8' }
  ]);
  let current_filter_params = queryString.parse(location.hash);
  const [per, setPer] = React.useState(current_filter_params.pe);
  const [perTo, setPerTo] = React.useState(current_filter_params.pe);
  const [ogu, setOU] = React.useState(current_filter_params.ou);
  const [levell, setLvl] = React.useState(current_filter_params.level);
  const prog_title =
    programs.filter(pr => {
      const iid = parseFloat(localStorage.getItem('program')) || 1;
      return pr.id == iid;
    })[0].name || 'Malaria';
  const [progTitle, setProgTitle] = React.useState(prog_title);
  const [loading, setLoading] = React.useState(false);
  const [isPeriodRange, setIsPeriodRange] = React.useState(false);

  const activProgId = parseFloat(localStorage.getItem('program')) || 1;
  const activProg = programs.filter(pr => pr.id == activProgId)[0];
  const paige = activProg.pages.filter(ep => ep.route == location.pathname)[0];
  const periodFilterType = paige.periodFilter;

  const checkIfPeriodRange = () => {
    if (periodFilterType === 'range') {
      setIsPeriodRange(true);
    } else {
      setIsPeriodRange(false);
    }
  };

  //-----------------------

  let fetchLevels = async () => {
    try {
      let lvls = [];
      setLoading(true);
      let url = endpts.find(ep => ep.name == 'Levels list')[
        process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url'
      ];
      justFetch(url, {
        signal: abortRequests.signal
      })
        .then(reply => {
          reply.fetchedData.organisationUnitLevels.map(lv => {
            lvls.push(lv);
          });
          setLevels(lvls);
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setErr({
              error: true,
              msg:
                'Error fetching levels: ' + process.env.REACT_APP_ENV == 'dev'
                  ? err.message
                  : ''
            });
          } else {
            console.log('Cancelling fetchLevel requests');
          }
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching levels' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
    }
  };

  let fetchCounties = async () => {
    try {
      let cties = [{ level: 1, name: 'Kenya (National)', id: 'HfVjCurKxh2' }];
      setLoading(true);
      let url = endpts.find(ep => ep.name == 'Counties list')[
        process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url'
      ];
      justFetch(url, {
        signal: abortRequests.signal
      })
        .then(reply => {
          reply.fetchedData.organisationUnits.map(cty => {
            cties.push(cty);
          });
          setCounties(cties);
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setErr({
              error: true,
              msg:
                'Error fetching counties: ' + process.env.REACT_APP_ENV == 'dev'
                  ? err.message
                  : ''
            });
          } else {
            console.log('Cancelling fetchCounties requests');
          }
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching counties' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
    }
  };

  let fetchSubcounties = async countyid => {
    let the_url;
    setLoading(true);
    if (process.env.REACT_APP_ENV == 'dev') {
      the_url = endpts.find(ep => ep.name == 'Subcounties list').local_url;
      if (countyid && countyid.length > 5) {
        the_url += '/' + countyid;
      }
    } else {
      the_url = endpts.find(ep => ep.name == 'Subcounties list').url;
    }
    try {
      justFetch(the_url, { signal: abortRequests.signal })
        .then(reply => {
          // let subc = reply.fetchedData.organisationUnits.filter(rp=>rp.parent.id == countyid)
          let subc = reply.fetchedData.organisationUnits;
          if (
            process.env.REACT_APP_ENV != 'dev' &&
            countyid &&
            countyid.length > 5
          ) {
            subc = subc.filter(sc => sc.parent.id == countyid);
          }
          setSubcounties([]);
          setSubcounties(subc);
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setErr({
              error: true,
              msg:
                'Error fetching subcounties: ' + process.env.REACT_APP_ENV ==
                'dev'
                  ? err.message
                  : ''
            });
          } else {
            console.log('Cancelling fetchSubcounties requests');
          }
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching subcounties' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
    }
  };

  let fetchWards = async subcountyid => {
    let the_url;
    setLoading(true);
    if (process.env.REACT_APP_ENV == 'dev') {
      the_url = endpts.find(ep => ep.name == 'Wards list').local_url;
      if (subcountyid && subcountyid.length > 5) {
        the_url += '/' + subcountyid;
      }
    } else {
      the_url = endpts.find(ep => ep.name == 'Wards list').url;
    }
    try {
      justFetch(the_url, { signal: abortRequests.signal })
        .then(reply => {
          let wds = reply.fetchedData.organisationUnits;
          if (
            process.env.REACT_APP_ENV != 'dev' &&
            subcountyid &&
            subcountyid.length > 5
          ) {
            wds = wds.filter(wd => wd.parent.id == subcountyid);
          }
          setWards([]);
          setWards(wds);
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setErr({
              error: true,
              msg:
                'Error fetching wards: ' + process.env.REACT_APP_ENV == 'dev'
                  ? err.message
                  : ''
            });
          } else {
            console.log('Cancelling fetchWards requests');
          }
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching wards' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
    }
  };

  let fetchFacilities = async wardid => {
    let the_url;
    setLoading(true);
    if (process.env.REACT_APP_ENV == 'dev') {
      the_url = endpts.find(ep => ep.name == 'Facilities list').local_url;
      if (wardid && wardid.length > 5) {
        the_url += '/' + wardid;
      }
    } else {
      the_url = endpts.find(ep => ep.name == 'Facilities list').url;
    }
    try {
      justFetch(the_url, { signal: abortRequests.signal })
        .then(reply => {
          let facs = reply.fetchedData.organisationUnits;
          if (
            process.env.REACT_APP_ENV != 'dev' &&
            wardid &&
            wardid.length > 5
          ) {
            facs = facs.filter(fc => fc.parent.id == wardid);
          }
          setFacilities([]);
          setFacilities(facs);
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setErr({
              error: true,
              msg:
                'Error fetching facilities: ' + process.env.REACT_APP_ENV ==
                'dev'
                  ? err.message
                  : ''
            });
          } else {
            console.log('Cancelling fetchFacilities requests');
          }
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching facilities' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
    }
  };

  let fetchCUnits = async facilityid => {
    let the_url;
    setLoading(true);
    if (process.env.REACT_APP_ENV == 'dev') {
      the_url = endpts.find(ep => ep.name == 'CUs list').local_url;
      if (facilityid && facilityid.length > 5) {
        the_url += '/' + facilityid;
      }
    } else {
      the_url = endpts.find(ep => ep.name == 'CUs list').url;
    }
    try {
      justFetch(the_url, { signal: abortRequests.signal })
        .then(reply => {
          let cunits = reply.fetchedData.organisationUnits;
          if (
            process.env.REACT_APP_ENV != 'dev' &&
            facilityid &&
            facilityid.length > 5
          ) {
            cunits = cunits.filter(cu => cu.parent.id == facilityid);
          }
          setCUnits([]);
          setCUnits(cunits);
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setErr({
              error: true,
              msg:
                'Error fetching facilities: ' + process.env.REACT_APP_ENV ==
                'dev'
                  ? err.message
                  : ''
            });
          } else {
            console.log('Cancelling fetchCUnits requests');
          }
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching community units' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
    }
  };

  const checkIfSet = () => {
    // console.log(`checkIfSet..ing`);
    checkIfPeriodRange();
    if (
      localStorage.getItem('program') === null ||
      localStorage.getItem('program') === undefined ||
      localStorage.getItem('program') === ''
    ) {
      //   console.log(`tB: program is NOT set`);
      window.location.replace('/');
    } else {
      //   console.log(`program is SET to ${localStorage.getItem('program')}`);
    }
  };

  useEffect(() => {
    checkIfSet();
    fetchCounties();
    // fetchLevels();
    return () => {
      console.log(`topbar aborting`);
    //   abortRequests.abort();
    };
  }, [location.pathname]);

  const handleChange = (perio, orgu, levl) => {
    console.log("------------------->>>>>>>> ");
    setLoading(true);
    if (levl == null || levl == '' || levl == undefined) {
      levl = current_filter_params.level;
      if (levl == null || levl == '' || levl == undefined) {
        levl = '~';
      }
    }
    if (perio == null || perio == '' || perio == undefined) {
      perio = current_filter_params.pe;
      if (perio == null || perio == '' || perio == undefined) {
        perio = '~';
      }
    }
    if (orgu == null || orgu == '' || orgu == undefined) {
      orgu = current_filter_params.ou;
      if (orgu == null || orgu == '' || orgu == undefined) {
        orgu = '~';
      }
    }
    try {
      //   if (
      histo.push(`${location.pathname}#ou=${orgu}&pe=${perio}&level=${levl}`);
      //   ) {
      //   } else {
      setLoading(false);
      //   }
    } catch (er) {
      setLoading(true);
      console.error(`Topbar.js: handleChange(): ${JSON.stringify(er)}`);
    }
  };
  //-----------------------

  //----------------------- monthpicker
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'pick-ou' : undefined;

  const handleClick2 = event => {
    setAnchorEl2(event.currentTarget);
  };
  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const handleClose2 = () => {
    setAnchorEl2(null);
  };
  const open2 = Boolean(anchorEl2);
  const id2 = open2 ? 'pick-pe' : undefined;

  const periodFrom = d => {
    let period = d.split('.')[1] + '' + d.split('.')[0];
    // document.getElementById("per_btn").innerHTML = mnths.filter(mn=>{ return mn.id==d.split(".")[0]})[0].name + " " +  d.split(".")[1] + " &#9662;"
    setPer(period);
    if (isPeriodRange === true) {
      document.querySelector('#per_to_btn').click();
    } else {
      handleChange(period, ogu, levell);
    }
  };

  const periodTo = t => {
    let periodT = t.split('.')[1] + '' + t.split('.')[0];
    setPerTo(periodT);
    const period_range = findPeriodRange([per, periodT]);
    handleChange(period_range, ogu, levell);
  };
  //----------------------- monthpicker

  // switch programs
  const switchProgram = progId => {
    const newActiveProg = programs.filter(pg => pg.id == progId)[0];
    setProgTitle(newActiveProg.name);
	localStorage.setItem('program', progId);
	
	// update valid org units
	localStorage.removeItem('validOUs')
	// update valid org units

    document.cookie = JSON.stringify({ program: progId });
    const newUrl = '/#/dashboard' + location.hash;
    window.location.replace(newUrl);
    window.location.reload();
  };
  // switch programs

  return (
    <AppBar {...rest} className={clsx(classes.root, className)}>
      <Toolbar variant="regular">
        <RouterLink to="/">
          <h3 className="fcwhite">
            <img src="images/logos/moh.png" className="mainlogo max-h-50-px m-r-5" />
            <Hidden smDown>HCD: </Hidden>
            &nbsp;
            <Hidden smDown>
              <span className="text-caps">{progTitle}</span>
            </Hidden>
          </h3>
        </RouterLink>
        <div className={classes.flexO}>
          <Hidden smDown>
            <span style={{ color: 'grey' }}>Filter: &nbsp;</span>
          </Hidden>
          {/* ----------------<FILTER>------------------ */}
          {paige?.ouFilter && <>
          <Button
            variant="contained"
            disableElevation
            color="secondary"
            aria-describedby={id}
            onClick={handleClick}
            id="cty_btn">
            <Hidden mdUp>
              <PinDropOutlined size="small" />
            </Hidden>
            <Hidden smDown>Organisation Unit&#9662; </Hidden>
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <div className="p-20">
              <label>Filter:</label>
              <br className="m-b-10" />
              {loading ? (
                <Alert severity="info">Loading...</Alert>
              ) : (
                <>
                  <Autocomplete
                    size="small"
                    id="pick-county"
                    disableClearable={true}
                    options={counties}
                    getOptionLabel={option => {
                      return option.name;
                    }}
                    style={{ width: 300 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Select a county"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    onChange={(r, value) => {
                      let cty = r.target.innerHTML;
                      if (value) {
                        setOU(value.id);
                        fetchSubcounties(value.id);
                        handleChange(per, value.id, levell);
                      }
                    }}
                  />
                  <br />
                  <Autocomplete
                    size="small"
                    id="pick-subcounty"
                    disableClearable={true}
                    options={subcounties}
                    getOptionLabel={option => {
                      return option.name;
                    }}
                    style={{ width: 300 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Select a subcounty"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    onChange={(r, value) => {
                      let scty = r.target.innerHTML;
                      if (value) {
                        setOU(value.id);
                        fetchWards(value.id);
                        handleChange(per, value.id, levell);
                      }
                    }}
                  />
                  <br />
                  <Autocomplete
                    size="small"
                    id="pick-ward"
                    disableClearable={true}
                    options={wards}
                    getOptionLabel={option => {
                      return option.name;
                    }}
                    style={{ width: 300 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Select a ward"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    onChange={(r, value) => {
                      let scty = r.target.innerHTML;
                      if (value) {
                        setOU(value.id);
                        fetchFacilities(value.id);
                        handleChange(per, value.id, levell);
                      }
                    }}
                  />
                  <br />
                  <Autocomplete
                    size="small"
                    id="pick-facility"
                    disableClearable={true}
                    options={facilities}
                    getOptionLabel={option => {
                      return option.name;
                    }}
                    style={{ width: 300 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Select a facility"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    onChange={(r, value) => {
                      let scty = r.target.innerHTML;
                      if (value) {
                        setOU(value.id);
                        handleChange(per, value.id, levell);
                      }
                    }}
                  />
                  <br />
                  <Autocomplete
                    size="small"
                    id="pick-level"
                    disableClearable={true}
                    options={levels}
                    getOptionLabel={option => {
                      return option.name;
                    }}
                    style={{ width: 300 }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Select a level"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    onChange={(r, value) => {
                      let scty = r.target.innerHTML;
                      if (value) {
                        setLvl(value.id);
                        handleChange(per, ogu, value.id);
                      }
                    }}
                  />
                </>
              )}
              <br />
              {/* <Button variant="contained" color="primary" >Apply</Button> */}
            </div>
          </Popover>
          </>}
          {/* ---------------------------------- */}
          &nbsp; &nbsp;
          {/* ---------------------------------- */}
          <Monthpicker
            format="MM.yyyy"
            onChange={periodFrom}
            locale="en"
            primaryColor="#01579b">
            <Button
              variant="contained"
              disableElevation
              color="secondary"
              id="per_btn">
              <Hidden mdUp>
                <CalendarTodayOutlined size="small" />
              </Hidden>
              <Hidden smDown>
                {' '}
                Period {isPeriodRange ? 'from' : ''} &#9662;{' '}
              </Hidden>
            </Button>
          </Monthpicker>
          &nbsp; &nbsp;
          {isPeriodRange === true ? (
            <Monthpicker
              format="MM.yyyy"
              onChange={periodTo}
              locale="en"
              primaryColor="#01579b">
              <Button
                variant="contained"
                disableElevation
                color="secondary"
                id="per_to_btn">
                <Hidden mdUp>
                  <CalendarTodayOutlined size="small" />
                </Hidden>
                <Hidden smDown> Period to &#9662; </Hidden>
              </Button>
            </Monthpicker>
          ) : (
            ''
          )}
          {/* ----------------</FILTER>------------------ */}
        </div>
        &nbsp; &nbsp;
        {/* ~~~~~~~~~~~~~~~~~~~~~~~~ appswitcher ~~~~~~~~~~~~~~~~~~~~~~~~ */}
        <Button
          variant="contained"
          disableElevation
          color="default"
          aria-describedby={id2}
          onClick={handleClick2}
          id="app_btn"
          size="large">
          <Apps size="small" /> &nbsp;
          <Hidden smDown>Programs &#9662; </Hidden>
        </Button>
        <Popover
          id={id2}
          open={open2}
          anchorEl={anchorEl2}
          onClose={handleClose2}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <div className="p-10">
            <Typography variant="h5" className="m-b-5">
              Switch Program Dashboards:
            </Typography>
            <Divider className="m-t-10 m-b-0 p-0" />
            <List component="nav" dense={false} className="m-t-0">
              {programs.map((op,opix) =>
                op.active ? (
                  <ListItem
                    component="a"
                    button
                    divider
                    key={op.id+"_"+opix+"_"+op.name}
                    onClick={() => {
                      switchProgram(op.id);
                    }}>
                    <ListItemAvatar>
                      <FolderOpenTwoTone />
                    </ListItemAvatar>
                    <ListItemText
                      primary={op.name}
                      secondary={op.owner}
                      primaryTypographyProps={{ variant: 'h5' }}
                    />
                    <ListItemSecondaryAction>
                      {' '}
                      <ArrowForward fontSize="small" />{' '}
                    </ListItemSecondaryAction>
                  </ListItem>
                ) : (
                  <div key={op.id+"_"+opix+"_"+op.name}>
                    <ListItem component="span" button  disabled  divider key={op.id}>
                      <ListItemAvatar>
                        <FolderOpenTwoTone />
                      </ListItemAvatar>
                      <ListItemText primary={op.name} secondary={op.owner} primaryTypographyProps={{ variant: 'h5' }}/>
						            <ListItemSecondaryAction> {' '} <ArrowForward fontSize="small" />{' '}</ListItemSecondaryAction>
                    </ListItem>
                  </div>
                )
              )}
            </List>
          </div>
        </Popover>
        {/* ~~~~~~~~~~~~~~~~~~~~~~~~ appswitcher ~~~~~~~~~~~~~~~~~~~~~~~~ */}
        <Hidden lgUp>
          <IconButton color="inherit" onClick={onSidebarOpen}>
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={loading}
        autoHideDuration={90000}
        message="Loading..."
      />
    </AppBar>
  );
};

export default React.memo(Topbar);
