import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Message from 'components/Message/Message';
import {
  filterUrlConstructor,
  justFetch
} from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Table from 'components/Table/Table';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Pending Shipments')[0];
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

const NatPendingShip = props => {
  const classes = useStyles();

  let filter_params = queryString.parse(props.location.hash);
  if (
    filter_params.pe &&
    filter_params.pe.search(';') > 0 &&
    periodFilterType != 'range'
  ) {
    filter_params.pe = 'LAST_MONTH';
  }
  filter_params.ou = "~"
  let [url, setUrl] = useState(
    filterUrlConstructor(
      filter_params.pe,
      filter_params.ou,
      filter_params.level,
      endpoints[0][process.env.REACT_APP_ENV == "dev" ? "url": "url"]
    )
  );
  const [penships, setPenShips] = useState([['Loading...']]);
  const [prd, setPrd] = useState(null);
  const [oun, setOun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(null);
  const [err, setErr] = useState({ error: false, msg: '' });
  let title = `National: Pending Shipments`;

  const updateData = (rws, priod, ogu, levl) => {
	setPenShips(rws);
    // setPrd(priod)
    // setOun(ogu)
    // setOulvl(levl)
  };

  
//////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\
const sumArr = (array) => {
    let sum_total = 0;
    if (array == null || array == undefined) {
        array = [0];
    }
    array.map((val) => {
        if (val == null || val == undefined) {
            val = 0;
        }
        sum_total += parseFloat(val);
    });
    return sum_total;
};
//////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\


  let fetchPenShip = async the_url => {
	setLoading(true);
	setErr({ error: false, msg: '' });
	setPenShips([['Loading...']]);
    try {
    //   fetch(the_url, { signal: abortRequests.signal })
      justFetch(the_url, { signal: abortRequests.signal })
        // .then(s_p => s_p.json())
        .then(reply => {
			if (reply.fetchedData == undefined || reply.fetchedData?.error) {
				setLoading(false)
				setErr({
					error: true,
					msg: reply?.fetchedData?.message || '',
					...reply
				});
			} else {
				setErr({ error: false, msg: '' });
				/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				/// ~~~~~~~~~~~~~~~~~~~~~~ <SUCCESS ~~~~~~~~~~~~~~~~~~~~~~~~~~
				/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				let tableData = [];
				let o_gu = oun		
				Object.keys(reply.fetchedData.pmi[0]).map((comm, inx)=>{ ///commodities
					let trow = [];
					trow.push(comm.toUpperCase())
					trow.push('-')
					let arr2sum = []
					Object.keys(reply.fetchedData).map((fnd, fnx)=>{ ///funding mechs
						let dtt = Object.values(reply.fetchedData[fnd])
						let vall = dtt[0][comm]
						trow.push(vall)
						arr2sum.push(parseFloat(vall))
					})
					trow.push(sumArr(arr2sum))
					tableData.push(trow)
				})
				updateData( tableData, prd, o_gu, oulvl );
				setLoading(false)
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
				console.log("Cancelling fetchPenShip requests");
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
      new_filter_params.ou = "~"
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
				new_filter_params.level,
				base_url
			);
			fetchPenShip(new_url);
		}
    });
  };

  useEffect(() => {
    let mounted = true
    if(mounted){
      fetchPenShip(url);
      onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "url": "url"]);
    }

    return () => {
      mounted = false
      console.log(`National Penship: aborting requests...`);
      abortRequests.abort();
    };
  }, []);

  let data = {};
  data.theads = [
    'Description',
    'Unit',
    'PMI Pending Shipments',
    'GF Pending Shipments',
    'UNICEF Pending Shipments',
    'MOH Pending Shipments',
    'Total Pending Shipments',
  ];
  data.rows = penships;

  return (
    <div className={classes.root}>
      <Toolbar className={classes.gridchild} title={title} pe={prd} ou={oun} lvl={oulvl} filter_params={filter_params} />
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

export default NatPendingShip;
