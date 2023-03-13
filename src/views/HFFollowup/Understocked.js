import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Message from 'components/Message/Message';
import {
  filterUrlConstructor,
  justFetch
} from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Table from 'components/Table/Table';
import MFLcell from 'components/Table/MFLcell';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Health Facility Followup')[0];
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

const Understocked = props => {
  const classes = useStyles();

  let filter_params = queryString.parse(props.location.hash);
  if (
    filter_params.pe &&
	filter_params.pe.search(';') > 0 
	// && periodFilterType != 'range'
  ) {
    filter_params.pe = 'LAST_MONTH';
  }
  let [url, setUrl] = useState(
    filterUrlConstructor(
      filter_params.pe,
      filter_params.ou,
      "5",//filter_params.level,
      endpoints[0][process.env.REACT_APP_ENV == "dev" ? "url": "url"]
    )
  );
  const [hfunderdata, setHFUnderdata] = useState([['Loading...']]);
  const [prd, setPrd] = useState(null);
  const [oun, setOun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(null);
  const [err, setErr] = useState({ error: false, msg: '' });
  const [commodity_url, setCommodityUrl] = useState(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "url": "url"]);
  let title = `Understocked Facilities`;

  const updateData = (rws, priod, ogu, levl) => {
    setHFUnderdata(rws);
    // setPrd(priod)
    // setOun(ogu)
	// setOulvl(levl)
  };

  
//////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\
const filterItems = (array,query) => {
    return array.filter(function(el) {
        return el.indexOf(query) > -1;
    })
}
const sumArr = arr => arr.reduce((a, b) => a + b, 0);
//////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\


  let fetchHFUnder = async the_url => {
	setLoading(true);
	setErr({ error: false, msg: '' });
    setHFUnderdata([['Loading...']]);
    try {
    //   fetch(the_url, { signal: abortRequests.signal })
      justFetch(the_url, { signal: abortRequests.signal })
        // .then(s_p => s_p.json())
        .then(reply => {
			setLoading(false)
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
			/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			/// ~~~~~~~~~~~~~~~~~~~~~~ <SUCCESS ~~~~~~~~~~~~~~~~~~~~~~~~~~
			/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			let tableData = []
			let o_gu = oun

			let orgunits = [];
			reply.fetchedData.rows.map( (rowentry) => {
				if (orgunits.indexOf(rowentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="ou")]) >= 0) {
				} else {
					orgunits.push(rowentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="ou")]);
				}
			});

			let orgunitmos = [];
			let orgunitphy = [];
			let orgunitdiff = [];
			let orgunitamc = [];

			reply.fetchedData.metaData.dimensions.ou.map( (o_ou) => {
				if (orgunits.indexOf(o_ou) >= 0) {
					reply.fetchedData.rows.map( (rowkentry) => {
						if (rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")] == reply.fetchedData.metaData.dimensions.dx[0] && o_ou == rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="ou")]) {
							orgunitmos[o_ou] = rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")];
						}
						if (rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")] == reply.fetchedData.metaData.dimensions.dx[1] && o_ou == rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="ou")]) {
							orgunitphy[o_ou] = rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")];
						}
						if (rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")] == reply.fetchedData.metaData.dimensions.dx[2] && o_ou == rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="ou")]) {
							orgunitamc[o_ou] = rowkentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")];
						}
					});
				}
			});

			orgunits.map( (one_ou) => {
				let trow = []
				if (orgunitmos[one_ou] > 0 && orgunitmos[one_ou] < 3) {
					let diffmos = (3 / parseFloat(orgunitmos[one_ou])) * parseFloat(orgunitphy[one_ou]);
					orgunitdiff[one_ou] = ( diffmos - parseFloat(orgunitphy[one_ou]) ).toFixed(0);
					if(isNaN(orgunitdiff[one_ou])){orgunitdiff[one_ou] = ''}
					trow.push(reply.fetchedData.metaData.items[one_ou].name)
					trow.push(<MFLcell dhis_code={one_ou}/>)
					trow.push(orgunitmos[one_ou])
					trow.push(orgunitamc[one_ou])
					trow.push(orgunitphy[one_ou])
					trow.push(orgunitdiff[one_ou])
					tableData.push(trow)
				}
			});
			updateData( tableData, reply.fetchedData.metaData.items[ reply.fetchedData.metaData.dimensions.pe[0] ].name || prd, o_gu, oulvl );
			/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			/// ~~~~~~~~~~~~~~~~~~~~~~ SUCCESS/> ~~~~~~~~~~~~~~~~~~~~~~~~~~
			/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
          setLoading(false);
        })
        .catch(err => {
			if(abortRequests.signal.aborted){ //if(err.name !== "AbortError"){
				setLoading(false);
				setErr({ error: true, msg: `Error fetching data: ' ${process .env.REACT_APP_ENV == "dev" ? err.message : ""}` });
			}else{
				console.log("Cancelling fetchHFUnder requests");
			}
        });
    } catch (er) {
      setErr({ error: true, msg: `Error fetching data ${process .env.REACT_APP_ENV == "dev" ? er.message : ""}` });
    }
  };

  const onUrlChange = base_url => {
    props.history.listen((location, action) => {
		if(location.pathname == paige.route){
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
				setOulvl(new_filter_params.level);
			}
			let new_url = filterUrlConstructor(
				new_filter_params.pe,
				new_filter_params.ou,
				"5",//new_filter_params.level,
				base_url
			);
			fetchHFUnder(new_url);
		}
    });
  };

  useEffect(() => {
	let mounted = true
	if(mounted){
		fetchHFUnder(url);
		onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "url": "url"]);
	}

    return () => {
		mounted = false
      console.log(`HFF:Under: aborting requests...`);
      abortRequests.abort();
    };
  }, []);

  let data = {};
	data.theads = [ 
		'Name',
		'Code',
		'MOS',
		'AMC',
		'Actual Stock',
		'Understocked by'
	];
  data.rows = hfunderdata;

  return (
    <div className={classes.root}>
	  <Grid container spacing={1}>
			<Grid item xs={12} sm={6} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
			{err.error ? (
				<></>
			) : (
				<Select
					className={(classes.gridchild, 'text-bold p-0')}
					variant="standard"
					autoWidth={true}
					style={{ fontSize: '1rem', padding: '5px' }}
					defaultValue={endpoints[0][process.env.REACT_APP_ENV == "dev" ? "url": "url"]}
					onChange={chp => {
						sessionStorage.setItem(
						'current_commodity',
						chp.target.value
						);
						setCommodityUrl(sessionStorage.getItem('current_commodity'));
						fetchHFUnder(
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
							value={sp[process.env.REACT_APP_ENV == "dev" ? "url": "url"]}>
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

export default Understocked;
