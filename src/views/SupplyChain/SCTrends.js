import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Message from 'components/Message/Message';
import { filterUrlConstructor, justFetch } from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Line from './components/Line';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Supply Chain Performance Trends')[0];
const endpoints = paige.endpoints;
const periodFilterType = paige.periodFilter;

const abortRequests = new AbortController();

const queryString = require('query-string');
const useStyles = makeStyles(theme => ({
  root: { padding: theme.spacing(3) },
  content: { marginTop: theme.spacing(1) },
  gridchild: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

const SCTrends = props => {
  const classes = useStyles();

  let filter_params = queryString.parse(props.location.hash);
  if (
    filter_params.pe == undefined ||
    filter_params.pe == '~' ||
    (filter_params.pe.search(';') <= 0 && periodFilterType == 'range')
  ) {
    filter_params.pe = 'LAST_6_MONTHS';
  }
  const base_rr_url = endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"];
  let [url, setUrl] = useState(
    filterUrlConstructor(
      'LAST_6_MONTHS',
      filter_params.ou,
      "5", //filter_params.level,
      base_rr_url
    )
  );
  const [sctrendata, setSCtrendata] = useState([[]]);
  const [period_s, setPeriods] = useState([]);
  const [prd, setPrd] = useState(null);
  const [oun, setOun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(null);
  const [err, setErr] = useState({ error: false, msg: '' });
  const [commodity_url, setCommodityUrl] = useState(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);
  let title = `Supply Chain Trends`;

  const updateSCTrendata = (rws, priod, ogu, levl) => {
    setSCtrendata(rws)
    setPeriods(priod);
    // setOun(ogu)
    // setOulvl(levl)
  };



  //////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\
  const filterItems = (array, query) => {
    return array.filter(function (el) {
      return el.indexOf(query) > -1;
    })
  }
  const sumArr = arr => arr.reduce((a, b) => a + b, 0);
  //////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\

  let fetchSCTrends = async rr_url => {
    setLoading(true);
    try {
      //rr
      //   fetch(rr_url, { signal: abortRequests.signal })
      justFetch(rr_url, { signal: abortRequests.signal })
        // .then(ad => ad.json())
        .then(reply => {
          if (reply.fetchedData == undefined || reply.fetchedData?.error) {
            let e_rr = {
              error: true,
              msg: reply?.fetchedData?.message || '',
              ...reply
            }
            setErr(e_rr);
            if (e_rr.msg.includes('aborted') || e_rr.msg.includes('NetworkError')) {
              props.history.go(0)
            }
          } else {

            ///////////////////////////////////////////////////////
            /////////////////////// SC ///////////////////////////

            let thedata = [];
            let the_periods = [];
            reply.fetchedData.metaData.dimensions.dx.map(one_dx => {
              let overstock_arr = {};
              overstock_arr['name'] = 'Overstocked';
              overstock_arr['color'] = ('#1aa3aa');
              overstock_arr['data'] = [];
              let stockok_arr = {};
              stockok_arr['name'] = 'Stocked according to plan';
              stockok_arr['color'] = ('#009900');
              stockok_arr['data'] = [];
              let understock_arr = {};
              understock_arr['name'] = 'Understocked';
              understock_arr['color'] = ('#f4bd3b');
              understock_arr['data'] = [];
              let stockout_arr = {};
              stockout_arr['name'] = 'Out of stock';
              stockout_arr['color'] = ('#ff2222');
              stockout_arr['data'] = [];

              reply.fetchedData.metaData.dimensions.pe.map(one_pe => {
                let overstock = 0;
                let stockok = 0;
                let understock = 0;
                let stockout = 0;
                the_periods.push(reply.fetchedData.metaData.items[one_pe].name);

                let rows_filteredby_period = filterItems(reply.fetchedData.rows, one_pe);
                let rows_filteredby_dx_period = filterItems(rows_filteredby_period, one_dx);


                rows_filteredby_dx_period.map(one_row => {
                  let row_val = one_row[reply.fetchedData.headers.findIndex(jk => jk.name == "value")];
                  if (row_val <= 0) {
                    stockout++;
                  }
                  if (row_val > 6) {
                    overstock++;
                  }
                  if (row_val >= 3 && row_val <= 6) {
                    stockok++;
                  }
                  if (row_val > 0 && row_val < 3) {
                    understock++;
                  }
                });
                overstock_arr['data'].push(overstock);
                stockok_arr['data'].push(stockok);
                understock_arr['data'].push(understock);
                stockout_arr['data'].push(stockout);
              });
              thedata.push(overstock_arr);
              thedata.push(stockok_arr);
              thedata.push(understock_arr);
              thedata.push(stockout_arr);
            });

            let o_gu = prd //reply.fetchedData.metaData.dimensions.ou[0];
            if (filter_params.ou && filter_params.ou != '~') {
              o_gu = filter_params.ou;
            } else {
              o_gu = reply.fetchedData.metaData.dimensions.ou[0];
            }

            updateSCTrendata(thedata, the_periods, o_gu, null);
            setLoading(false);

            /////////////////////// SC ///////////////////////////
            ///////////////////////////////////////////////////////
          }
        })
        .catch(err => {
          if (abortRequests.signal.aborted) { //if(err.name !== "AbortError"){
            setLoading(false);
            setErr({ error: true, msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == "dev" ? err.message : ""}` });
          } else {
            console.log("Cancelling fetchSCTrends requests");
          }
        });
    } catch (er) {
      setErr({ error: true, msg: 'Error fetching data' });
    }
  };

  const onUrlChange = base_url => {
    props.history.listen((location, action) => {
      if (location.pathname == paige.route) {
        let new_filter_params = queryString.parse(location.hash);
        if (
          new_filter_params.pe != '~' &&
          new_filter_params.pe != '' &&
          new_filter_params.pe != null
        ) {
          // setPrd(new_filter_params.pe);
          setPrd('LAST_6_MONTHS');
        }
        if (new_filter_params.pe && new_filter_params.pe.search(';') <= 0) {
          new_filter_params.pe = 'LAST_6_MONTHS';
          setPrd('LAST_6_MONTHS');
        }
        if (
          new_filter_params.ou != '~' &&
          new_filter_params.ou != '' &&
          new_filter_params.ou != null
        ) {
          setOun(new_filter_params.ou);
        }
        if (
          new_filter_params.level != '~' &&
          new_filter_params.level != '' &&
          new_filter_params.level != null
        ) {
          setOulvl(new_filter_params.level);
        }
        let new_url = filterUrlConstructor(
          new_filter_params.pe,
          new_filter_params.ou,
          "5", // new_filter_params.level,
          base_url
        );
        fetchSCTrends(new_url);
      }
    });
  };

  useEffect(() => {
    let mounted = true
    if (mounted) {
      fetchSCTrends(url);
      onUrlChange(base_rr_url);
    }

    return () => {
      mounted = false
      console.log(`SC:Trends aborting requests...`);
      abortRequests.abort();
    };
  }, []);

  return (
    <div className={classes.root}>
      <Grid container spacing={1} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <Grid item xs={12} sm={6}>
          {err.error ? (
            <></>
          ) : (
            <Select
              className={(classes.gridchild, 'text-bold p-0')}
              variant="standard"
              autoWidth={true}
              style={{ fontSize: '1rem', padding: '5px' }}
              defaultValue={endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]}
              onChange={chp => {
                sessionStorage.setItem(
                  'current_commodity',
                  chp.target.value
                );
                setCommodityUrl(sessionStorage.getItem('current_commodity'));
                fetchSCTrends(
                  filterUrlConstructor(
                    filter_params.pe,
                    filter_params.ou,
                    "5", //filter_params.level,
                    sessionStorage.getItem('current_commodity')
                  )
                );
              }}>

              {endpoints.map((sp, kyy) => {
                return (
                  <MenuItem
                    key={kyy}
                    className="text-bold"
                    value={sp[process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]}>
                    {sp.name}
                  </MenuItem>
                );
              })}
            </Select>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Toolbar
            className={classes.gridchild}
            title={title}
            pe={prd}
            ou={oun}
            lvl={oulvl}
            // filter_params={filter_params}
          />
        </Grid>
      </Grid>

      <div className={classes.content}>
        {err.error ? (
          <Message severity="error">{err.msg}</Message>
        ) : (
          <Grid container direction="row" spacing={2}>
            <Line
              p_eriods={period_s}
              scData={sctrendata}
              loading={loading}
            />
          </Grid>
        )}
      </div>
    </div>
  );
};

export default SCTrends;
