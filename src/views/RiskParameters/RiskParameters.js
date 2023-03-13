import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Message from 'components/Message/Message';
import {
  filterUrlConstructor,
  getValidOUs,
  justFetch
} from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Table from 'components/Table/Table';
import MFLcell from 'components/Table/MFLcell';
import ShadedCell from 'components/Table/ShadedCell';
import { Build } from '@material-ui/icons';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const prog_thresholds = activProg.thresholds;
const paige = activProg.pages.filter(ep => ep.page == 'Risk Parameters')[0];
const periodFilterType = paige.periodFilter;
const endpoints = paige.endpoints;

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


const RiskParameters = props => {
  const classes = useStyles();

  // ------pages-------
  const [spages, setSSPages] = useState([['Loading...']]);
  // ------pages-------
  let filter_params = queryString.parse(props.location.hash);
  if (
    filter_params.pe &&
    filter_params.pe.search(';') > 0 &&
    periodFilterType != 'range'
  ) {
    filter_params.pe = 'LAST_3_MONTHS';
  }
  filter_params.level = 5;
  const risk_params_url=["risk_1,risk"]
  
  let [url, setUrl] = useState(
    filterUrlConstructor(
      filter_params.pe,
      filter_params.ou,
      5,
      endpoints[0][process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url']
    )
  );

  let mnmx = prog_thresholds.national || [9, 18];
  let mnmxy = [0, 24];
  if (filter_params.ou == '~' || filter_params.ou == 'HfVjCurKxh2') {
    mnmx = prog_thresholds.national || [9, 18];
    mnmxy = [0, 24];
  } else {
    mnmx = prog_thresholds.subnational || [3, 6];
    mnmxy = [0, 10];
  }

  const [sdata, setSSData] = useState([['Loading...']]);
  const [prd, setPrd] = useState(null);
  const [validOUs, setValidOUs] = useState(
    JSON.parse(localStorage.getItem('validOUs'))
  );
  const [oun, setOun] = useState(null);
  const [hds, setHds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(5);
  const [commodity_url, setCommodity] = useState(
    endpoints[0][process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url']
  );
  const [err, setErr] = useState({ error: false, msg: '' });
  let [minmax, setMinMax] = useState(mnmx);
  let title = `Risk Parameters`;



  const updateData = (rws, priod, ogu, levl) => {
    setSSData(rws);
  };

  let fetchAL = async the_url => {
    setLoading(true);
    setSSData([['Loading...']]);
    try {
      //   fetch(the_url, { signal: abortRequests.signal })
      justFetch(the_url, { signal: abortRequests.signal })
        // .then(ad => ad.json())
        .then(reply => {
          if (reply.fetchedData == undefined || reply.fetchedData?.error) {
            let e_rr = {
              error: true,
              msg: reply?.fetchedData?.message || '',
              ...reply
            };
            setErr(e_rr);
            if (
              e_rr.msg.includes('aborted') ||
              e_rr.msg.includes('NetworkError')
            ) {
              props.history.go(0);
            }
          } else {
            setErr({ error: false, msg: '' });
            //check if error here
            let rows_data = [];
            const rows = reply.fetchedData.rows;
            let all_ous = [];

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
            setHds([]);
            const heds = [];
            let new_row = []
            let k = rows.map(row => new_row.push(row[1]))
            let missing_org_units_risk_eight = reply.fetchedData.metaData.dimensions.ou.filter(org => !new_row.includes(org))

            function onlyUnique(value, index, self) {
              return self.indexOf(value) === index;
            }
            let missing_org_units_risk = missing_org_units_risk_eight.filter(onlyUnique)
            console.log(missing_org_units_risk.length)
            

            //
            reply.fetchedData.metaData.dimensions.dx.map((dxh, indxh) => {
              let headline = reply.fetchedData.metaData.items[dxh].name
                .replace('HCD - ', '')
                .replace(' - HF', '')
                .replace('MOH 743', '')
                .replace('Rev2020_', '')
                .replace('PMI', '')
                .replace('_', ' ')
                .replace('MoH 730B', '')
                .replace('TB/ HIV DRUGS ', '')
                .replace('Revision 2017', '')
                .replace('MCD_', '')
                .replace('MCD ', '')
                .replace('MOH 647', '')
                .replace('Medicines for OIs ', '')
                .replace('FP_', '')
                .replace('FP', '')
                .replace('HIV-', '')
                .replace(', FP', '')
                .replace('Revision', '')
                .replace('Rev ', '')
                .replace('2016', '')
                .replace('24s', '24')
                .replace('6s', '6')
                .replace('12s', '12')
                .replace('2017', '')
                .replace('2018', '')
                .replace('2019', '')
                .replace('2020', '')
                .replace('Adjusted Consumption', 'AMC')
                .replace('HF', '')
                .replace('Paediatric preparations', '')
                .replace('Adult preparations', '')
                .replace('End of Month', '')
                .replace('Physical Stock Count', '')
                .replace('MOH 647_', '')
                .replace('MOH 743 Rev2020_', '')
                .replace('Physical Count', 'SOH')
                .replace('Ending Balance', '')
                .replace('Closing Balance', '')
                .replace('Artemether-Lumefantrine ', 'AL')
                .replace('20/120', '')
                .replace('Tabs', '');
              if (headline.toLocaleLowerCase().includes('reporting')) {
                if (headline.toLocaleLowerCase().includes('time')) {
                  headline = 'Reporting rate on time';
                } else {
                  headline = 'Reporting rate';
                }
              }
              heds.push(headline);
            });
            setHds(heds);

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
            reply.fetchedData.metaData.dimensions.ou.map((o_ou, ix) => {
              // if (rows.length > 0) {
              if (validOUs && validOUs.includes(o_ou) && rows.length > 0) {
                let ou_rows = rows.filter(
                  o_r =>
                    o_r[
                    reply.fetchedData.headers.findIndex(jk => jk.name == 'ou')
                    ] == o_ou
                );
                let ro_w = [];
                if (the_url.includes('dimension=dx:f0AIAR5pJ2F.w77uMi1KzOH&filter=pe:LAST_3_MONTHS') || //Risk 1
                  the_url.includes('dimension=dx:Bi2Lyr2ZZk0&filter=pe:LAST_MONTH') || //Risk 2
                  the_url.includes('dimension=dx:mXWDzCMWWaW&filter=pe:LAST_MONTH') || //risk 3
                  the_url.includes('dimension=dx:RURwrNJC9h6') ||// risk 4 
                  the_url.includes('dimension=dx:f0AIAR5pJ2F.rPAsF4cpNxm&filter=pe:LAST_MONTH') || //risk 8 
                  the_url.includes('dimension=dx:RRnz4uPHXdl.ACTUAL_REPORTS&filter=pe:LAST_MONTH') 


                ) {

                  rows.map(row => {

                    if (
                      // Risk 1
                      row[1] == o_ou &&
                      row[2] > 2000 &&
                      row[0] == 'f0AIAR5pJ2F.w77uMi1KzOH'
                    ) {
                      ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                      ro_w.push(<MFLcell dhis_code={o_ou} />);
                    }
                    if (
                      // risk 2
                      row[0] == 'Bi2Lyr2ZZk0' &&
                      row[1] == o_ou &&
                      row[2] > 10
                    ) {
                      ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                      ro_w.push(<MFLcell dhis_code={o_ou} />);
                    }
                    if (row[0] == 'mXWDzCMWWaW' &&
                      row[1] == o_ou) {
                      //Risk 3
                      ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                      ro_w.push(<MFLcell dhis_code={o_ou} />);
                    }
                    if (row[2] > 10 && row[1] == o_ou && the_url.includes('dimension=dx:RURwrNJC9h6')) {
                      // Risk 4
                      ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                      ro_w.push(<MFLcell dhis_code={o_ou} />);
                    }
                    if (row[2] == 0 && row[1] == o_ou && the_url.includes('dimension=dx:RRnz4uPHXdl.ACTUAL_REPORTS&filter=pe:LAST_MONTH') ) {
                      // Risk 9
                      ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                      ro_w.push(<MFLcell dhis_code={o_ou} />);
                    }
                    if(row[1] == o_ou && the_url.includes('dimension=dx:f0AIAR5pJ2F.rPAsF4cpNxm&filter=pe:LAST_MONTH')){
                      // risk 8
                      missing_org_units_risk.map(org_unit => {
                        if (org_unit == o_ou
                        ) {
                          ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                          ro_w.push(<MFLcell dhis_code={o_ou} />);
                        }
                        })
                    }
                    
                  });    
                } 
                else {
                  ro_w.push(reply.fetchedData.metaData.items[o_ou].name);
                  ro_w.push(<MFLcell dhis_code={o_ou} />);
                }


                reply.fetchedData.metaData.dimensions.dx.map((o_dx, inx) => {
                  let dx_rows = ou_rows.filter(
                    o_dx_rw =>
                      o_dx_rw[
                      reply.fetchedData.headers.findIndex(
                        jk => jk.name == 'dx'
                      )
                      ] == o_dx
                  );
                  if (dx_rows.length > 0) {
                    let dxval =
                      dx_rows[0][
                      reply.fetchedData.headers.findIndex(
                        jk => jk.name == 'value'
                      )
                      ];
                    let n_cell;
                    if (the_url.includes('dimension=dx:f0AIAR5pJ2F.w77uMi1KzOH&filter=pe:LAST_3_MONTHS') || // risk 1
                      the_url.includes('dimension=dx:Bi2Lyr2ZZk0&filter=pe:LAST_MONTH') ||
                      the_url.includes('dimension=dx:mXWDzCMWWaW&filter=pe:LAST_MONTH') ||
                      the_url.includes('dimension=dx:RURwrNJC9h6') ||
                      the_url.includes('dimension=dx:f0AIAR5pJ2F.rPAsF4cpNxm&filter=pe:LAST_MONTH') || // risk 8
                      the_url.includes('dimension=dx:RRnz4uPHXdl.ACTUAL_REPORTS&filter=pe:LAST_MONTH')
                    ) {
                      if (dxval > 2000 && the_url.includes('dimension=dx:f0AIAR5pJ2F.w77uMi1KzOH&filter=pe:LAST_3_MONTHS')) {
                        //risk 1
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (dxval > 10 && the_url.includes('dimension=dx:Bi2Lyr2ZZk0&filter=pe:LAST_MONTH')) {
                        //risk 2
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (dxval && the_url.includes('dimension=dx:mXWDzCMWWaW&filter=pe:LAST_MONTH')) {
                        //Risk 3
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (dxval > 10 && the_url.includes('dimension=dx:RURwrNJC9h6')) {
                        // risk 4
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (the_url.includes('dimension=dx:f0AIAR5pJ2F.rPAsF4cpNxm&filter=pe:LAST_MONTH')) {
                        //risk 8
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val="0"
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);

                      }
                      if(dxval == 0 && the_url.includes('dimension=dx:RRnz4uPHXdl.ACTUAL_REPORTS&filter=pe:LAST_MONTH')){
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val="0"
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);

                      }

                    }
                    else {
                      if (
                        dxval !== undefined &&
                        the_url.includes('VlJEww8KcUD')
                      ) {
                        //risk 3
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }

                      if (
                        dxval !== undefined &&
                        the_url.includes('RURwrNJC9h6')
                      ) {
                        // risk 4
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (
                        dxval !== undefined &&
                        the_url.includes('rqzfl66VFyd')
                      ) {
                        // risk 5
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (
                        dxval !== undefined &&
                        the_url.includes('c6A37DQWMIt')
                      ) {
                        // risk 6
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (
                        dxval !== undefined &&
                        the_url.includes('rPAsF4cpNxm')
                      ) {
                        // risk 7
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }
                      if (
                        dxval !== undefined &&
                        the_url.includes('rPAsYicpNxml')
                      ) {
                        // risk 8
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }

                      if (
                        dxval !== undefined &&
                        the_url.includes('xKXO1rvSnRh')
                      ) {
                        // risk 10
                        n_cell = (
                          <ShadedCell
                            classes="cell-fill cell-amber"
                            val={dxval}
                          />
                        );
                        dxval = n_cell;
                        ro_w.push(dxval);
                        rows_data.push(ro_w);
                      }

                    }
                  }
                });
              }
            });
            let o_gu;
            if (filter_params.ou) {
              o_gu = 'HfVjCurKxh2'
              //filter_params.ou;
            } else {
              o_gu = '';
            }
            updateData(
              rows_data,
              reply.fetchedData.metaData.items[
                reply.fetchedData.metaData.dimensions.pe[0]
              ].name,
              o_gu,
              oulvl
            );
          }
          setLoading(false);
        })
        .catch(err => {
          if (abortRequests.signal.aborted) {
            //if(err.name !== "AbortError"){
            setLoading(false);
            setErr({
              error: true,
              msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == 'dev' ? err.message : ''
                }`
            });
          } else {
            console.log('Cancelling fetchAL requests');
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
          // setOulvl(new_filter_params.level);
          setOulvl(5);
        }
        let new_url = filterUrlConstructor(
          new_filter_params.pe,
          new_filter_params.ou,
          '5', //new_filter_params.level,
          // endpoints[0][process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url']
          sessionStorage.getItem('active_risk_url')
          // base_url
        );
        fetchAL(new_url);
      }
    });
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      console.log("fffffffffffffffff");
      fetchAL(url);
      const act_comm_url =
        localStorage.getItem('active_risk_url') ||
        // endpoints.map((active_url, kyy) => {
        //   active_url[
        //     process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url'
        //     ]
        // })

      endpoints[0][process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url']; //One
      console.log("################### "+act_comm_url);
      onUrlChange(act_comm_url);
      getValidOUs().then(vo => {
        let vFlS = JSON.parse(localStorage.getItem('validOUs'));
        if (vFlS && vFlS.length < 1) {
          setValidOUs(vo);
    
        }
      });
    }

    return () => {
      mounted = false;
      abortRequests.abort();
    };
  }, []);

  let data = {};
  data.theads = ['Name', 'MFL Code'];
  data.theads = [...data.theads, ...hds];
  data.rows = sdata;

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={1}
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Grid item xs={12} sm={6}>
          {err.error ? (
            <></>
          ) : (
            <Select
              className={(classes.gridchild, 'text-bold p-0')}
              variant="standard"
              autoWidth={true}
              style={{ fontSize: '1rem', padding: '5px' }}
              defaultValue={
                endpoints[0][
                process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url' // two
                ]
              }
              // on commodity change
              onChange={chp => {
                console.log("sssssssssssssssss");
                sessionStorage.setItem(
                  'active_risk_url',
                  chp.target.value
                );
                setCommodity(sessionStorage.getItem('active_risk_url'));
                fetchAL(
                  filterUrlConstructor(
                    filter_params.pe,
                    filter_params.ou,
                    '5', //filter_params.level,
                    sessionStorage.getItem('active_risk_url')
                  )
                );
              }}>
              {endpoints.map((sp, kyy) => {
                return (
                  <MenuItem
                    key={kyy}
                    className="text-bold"
                    value={
                      sp[
                      process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url'
                      ]
                    }>
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
            // legends={lgnd}
            filter_params={filter_params}
          />
        </Grid>
      </Grid>
      <div className={classes.content}>
        {err.error ? (
          <Message severity="error">{err.msg}</Message>
        ) : (
          <Table
            pageTitle={title}
            theads={data.theads}
            rows={data.rows}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default RiskParameters;
