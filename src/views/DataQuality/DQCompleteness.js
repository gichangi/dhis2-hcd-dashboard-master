import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Message from 'components/Message/Message';
import Grid from '@material-ui/core/Grid';
import Toolbar from 'components/Toolbar/Toolbar';
import { filterUrlConstructor, justFetch, getValidOUs } from 'common/utils';
import Table from 'components/Table/Table';
import MFLcell from 'components/Table/MFLcell';
import LineGraph from './components/LineGraph/LineGraph';
import { programs } from 'hcd-config';
import { all } from 'underscore';

const abortRequests = new AbortController();

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == "Data Quality: Completenes")[0];
const periodFilterType = paige.periodFilter;
const endpoints = paige.endpoints;

const queryString = require('query-string');
const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  sstatus: {
    height: '400px'
  }
}));

const DQCompleteness = props => {
  const classes = useStyles();

  let filter_params = queryString.parse(props.location.hash);
  console.log('Filter: ', filter_params.pe);
  if (
    filter_params.pe &&
    // filter_params.pe.search(';') < 1 &&
    !filter_params.pe.includes(';') &&
    !filter_params.pe.includes('LAST')
  ) {
    filter_params.pe = 'LAST_6_MONTHS';
  }
  //Default to last 6 months
  if (filter_params.pe=='LAST_MONTH' || filter_params.pe == undefined) 
  {
    filter_params.pe = 'LAST_6_MONTHS';
  }
  const [summaryData, setSummary] = useState([]);
  const [facilitiesReport, setFacilitiesReport] = useState([['Loading ...']]);
  const [peList, setPeList] = useState([]);
  const [facilitiesNoReport, setFacilitiesNoReport] = useState([['Loading...']]);
  const [prd, setPrd] = useState(filter_params.pe);
  const [oun, setOun] = useState(filter_params.ou);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(null);
  const [err, setErr] = useState({ error: false, msg: '' });
  const [latest_month, setLatestMonth] = useState(null);
  const [u_rl, setUrl] = useState(
    filterUrlConstructor(
      filter_params.pe,
      filter_params.ou,
      5,
      endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]
    )
  );
  console.log('DQ URL', u_rl);
  const [validOUs, setValidOUs] = useState(
    JSON.parse(localStorage.getItem('validOUs'))
  );
  let title = `Data Quality: Completeness`;

  const updateSummary = (rws, priod, ogu, levl) => {
    setSummary(rws);
    setPrd(priod);
    // setOun(oun)
    // setOulvl(levl)
  };
  const updateFacilitiesReport = (rws) => {
    setFacilitiesReport(rws);
  };
  const updatePeList = (pes) => {
    setPeList(pes);
  };

  const updateFacilitiesNoReport = (rws) => {
    setFacilitiesNoReport(rws);
  };

  let fetchDQCompleteness = async (u_rl) => {
    setLoading(true);
    try {
      //   fetch(u_rl, { signal: abortRequests.signal })
      justFetch(u_rl, { signal: abortRequests.signal })
        // .then(ad => ad.json())
        .then(reply => {
          setLoading(false);
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
            setErr({ error: false, msg: '' });
            let summaryData = []
            let facReport = []
            let facNoReport = []
            let lastperd = reply.fetchedData.metaData.dimensions.pe[reply.fetchedData.metaData.dimensions.pe.length - 1];
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~<SUCCESS~~~~~~~~~~~~~~~~~~

            let reported = [];
            let expected = [];
            let pelist = []
            let all_list_facilities_with_wb_data = []

            reply.fetchedData.metaData.dimensions.pe.map((period) => {
              let total = 0;
              let expected_t = 0;
              let list_facilities_with_wb_data = []
              reply.fetchedData.rows.map((onerow) => {
                if(process.env.REACT_APP_ENV == "dev")
                {
                    if (period === onerow[1] && onerow[0] === reply.fetchedData.metaData.dimensions.dx[0]) {
                      total = total + 1;
                      if (period == lastperd) {
                        list_facilities_with_wb_data.push(onerow[2])
                      }
                    } else
                      if (period === onerow[1] && onerow[0] === reply.fetchedData.metaData.dimensions.dx[1]) {
                        expected_t = expected_t + 1;
                      }
                }
                else
                {
                    if (period === onerow[2] && onerow[0] === reply.fetchedData.metaData.dimensions.dx[0]) {
                      total = total + 1;
                      if (period == lastperd) {
                        list_facilities_with_wb_data.push(onerow[1])
                      }
                    } else
                      if (period === onerow[2] && onerow[0] === reply.fetchedData.metaData.dimensions.dx[1]) {
                        expected_t = expected_t + 1;
                      }
                }
              });
              all_list_facilities_with_wb_data.push(list_facilities_with_wb_data)
              reported.push(total);
              expected.push(expected_t);
              pelist.push(reply.fetchedData.metaData.items[period].name)
            });
            all_list_facilities_with_wb_data = all_list_facilities_with_wb_data.find(w_wb_d => w_wb_d.length > 0)
            let didNotReport = [];
            reported.map((value, index) => {
              const facilities = expected[index];
              let empty_reports = facilities - value
              didNotReport.push(empty_reports)
            });
            let wbdataset = [];

            wbdataset.push(pelist);
            wbdataset.push(reported);
            wbdataset.push(didNotReport);
            summaryData = [
              { name: "Facilities with weight band data", data: reported },
              { name: "Facilities without weight band data", data: didNotReport }
            ]
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~SUCCESS/>~~~~~~~~~~~~~~~~~
            updateSummary(summaryData)
            setLatestMonth(reply.fetchedData.metaData.items[
              reply.fetchedData.metaData.dimensions.pe[reply.fetchedData.metaData.dimensions.pe.length - 1]
            ].name)


            //////////////////////
            ////// DETAIL ////////
            // ~~~~~~~~~~~~~~~~~~~~~~~~REPORTED~~~~~~~~~~~~~~~~~~~~~~~~

            let rp_fac_codes = [];
            reply.fetchedData.rows.map((row_val) => {
              if (lastperd === row_val[1] && !rp_fac_codes.includes(row_val[2])) {
                  rp_fac_codes.push(row_val[1]);
                  if(process.env.REACT_APP_ENV == "dev")
                  {
                      rp_fac_codes.push(row_val[2]);
                  }

              }
            });

            all_list_facilities_with_wb_data.map((rpfc_val, ix) => {
              let reported_trow = []
              reported_trow.push(reply.fetchedData.metaData.items[rpfc_val].name)
              reported_trow.push(<MFLcell dhis_code={rpfc_val} />)
              facReport.push(reported_trow)
            });
            updateFacilitiesReport(facReport)

            // ~~~~~~~~~~~~~~~~~~~~~~~~NOT~~REPORTED~~~~~~~~~~~~~~~~~~~~~~
            let valid_orgs = validOUs;
            let dimen_valid_ous = reply.fetchedData.metaData.dimensions.ou.filter(ou => valid_orgs.includes(ou))
            let facs_not_reported = dimen_valid_ous.filter(dou => { return !all_list_facilities_with_wb_data.includes(dou) })
            facs_not_reported.map((not_rpfc_val, ix) => {
              let not_reported_trow = []
              not_reported_trow.push(reply.fetchedData.metaData.items[not_rpfc_val].name)
              not_reported_trow.push(<MFLcell dhis_code={not_rpfc_val} />)
              facNoReport.push(not_reported_trow)
            });
            updateFacilitiesNoReport(facNoReport)
            ////// DETAIL ////////
            //////////////////////
            updatePeList(pelist)
          }
        })
        .catch(err => {
          if (abortRequests.signal.aborted) { //if(err.name !== "AbortError"){
            setLoading(false);
            setErr({ error: true, msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == "dev" ? err.message : ""}` });
          } else {
            console.log("Cancelling fetchDQCompleteness requests");
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
          setPrd(new_filter_params.pe);
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
          setOulvl(5);//setOulvl(new_filter_params.level);
        }
        let new_url = filterUrlConstructor(
          new_filter_params.pe,
          new_filter_params.ou,
          5,
          base_url
        );
        console.log('New URL: ', new_url);
        fetchDQCompleteness(
          new_url,
        );
      }
    });
  };

  useEffect(() => {
    let mounted = true
    if (mounted) {
      fetchDQCompleteness(u_rl);
      onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);
      getValidOUs().then(vo => {
        let vFlS = JSON.parse(localStorage.getItem('validOUs'));
        if (vFlS && vFlS.length < 1) {
          setValidOUs(vo);
        }
      });
    }

    return () => {
      mounted = false
      console.log(`DQ:Completeness aborting requests...`);
      abortRequests.abort();
    };
  }, []);

  return (
    <div className={classes.root}>
      <Toolbar
        title={title}
        pe={prd}
        ou={oun}
        lvl={null}
        filter_params={filter_params}
      />
      <Grid container spacing={4}>
        {err.error ? (
          <Message severity="error">{err.msg}</Message>
        ) : (
          <>
            <Grid
              item
              lg={12}
              md={12}
              xl={12}
              xs={12}
              justify="center"
              container>
              <Grid item lg={12} md={12} xl={12} xs={12}>
                <LineGraph
                  data={summaryData}
                  period={peList}
                />
              </Grid>
            </Grid>
            <br />
            <Grid item lg={6} md={6} xl={6} xs={12}>
              {/* <h4>Facilities w/ report</h4> */}
              <Table
                pageTitle={`Facilities that did NOT report data ${latest_month ? '(' + latest_month + ')' : ""}: ${facilitiesNoReport.length}`}
                theads={['Name', 'Code']}
                rows={facilitiesNoReport}
                loading={false}
              />
            </Grid>
            <Grid item lg={6} md={6} xl={6} xs={12}>
              {/* <h4>Facilities No report</h4> */}
              <Table
                pageTitle={`Facilities that reported data ${latest_month ? '(' + latest_month + ')' : ""}: ${facilitiesReport.length}`}
                theads={['Name', 'Code']}
                rows={facilitiesReport}
                loading={false}
              />
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
};

export default DQCompleteness;
