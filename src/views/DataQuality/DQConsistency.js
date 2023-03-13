import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Message from 'components/Message/Message';
import { filterUrlConstructor, getValidOUs, justFetch } from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import PieChart from './components/PieChart/PieChart';
import Table from 'components/Table/Table';
import MFLcell from 'components/Table/MFLcell';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Data Quality: Consistency')[0];
const endpoints = paige.endpoints;
const periodFilterType = paige.periodFilter;

const abortRequests = new AbortController();

const queryString = require('query-string');
const useStyles = makeStyles(theme => ({
	root: {
		padding: theme.spacing(4)
	},
	sstatus: {
		height: '400px'
	}
}));

const DQConsistency = props => {
	const classes = useStyles();

	let filter_params = queryString.parse(props.location.hash);
	if (
		filter_params.pe == undefined ||
		filter_params.pe == '~' ||
		(filter_params.pe.search(';') <= 0 && periodFilterType == 'range')
	) {
		filter_params.pe = 'LAST_MONTH';
	}
	const base_rr_url = endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"];
	let [url, setUrl] = useState(
		filterUrlConstructor(
			filter_params.pe,
			filter_params.ou,
			"5", //filter_params.level,
			base_rr_url
		)
	);
	const [validOUs, setValidOUs] = useState(
		JSON.parse(localStorage.getItem('validOUs'))
	);
	const [summaryData, setSummaryData] = useState([]);
	const [noDiscrepancy, setNoDiscrepancy] = useState([[]]);
	const [withDiscrepancy, setWithDiscrepancy] = useState([[]]);
	//const [prd, setPrd] = useState('LAST_MONTH');
	//const [oun, setOun] = useState(null);
	const [prd, setPrd] = useState(filter_params.pe);
    const [oun, setOun] = useState(filter_params.ou);
	const [loading, setLoading] = useState(true);
	const [oulvl, setOulvl] = useState(null);
	const [err, setErr] = useState({ error: false, msg: '' });
	const [commodity_url, setCommodityUrl] = useState(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);
	let title = `Data Quality: Consistency`;

	const updateSummaryData = (rws, priod, ogu, levl) => {
		setSummaryData(rws)
		// setPrd(ogu)
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

	let fetchDQConsistency = async rr_url => {
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
						let pie_data = {};

						//&&&&&&&&&&&&&&&&&&&&&
						let compliant_facility_count = 0;
						let nodisc_facilities_names = [];
						let nodisc_facilities_codes = [];
						let disc_facilities_names = [];
						let disc_facilities_codes = [];
						let noDiscrepancy = [];
						let withDiscrepancy = [];

						let begbal_code = reply.fetchedData.metaData.dimensions.dx[0];
						let qty_recv_code = reply.fetchedData.metaData.dimensions.dx[1];
						let pos_adj_code = reply.fetchedData.metaData.dimensions.dx[2];
						let neg_adj_code = reply.fetchedData.metaData.dimensions.dx[3];
						let qty_disp_code = reply.fetchedData.metaData.dimensions.dx[4];
						let phy_count_code = reply.fetchedData.metaData.dimensions.dx[5];

						reply.fetchedData.metaData.dimensions.ou.map(oneou => {
							if (validOUs.includes(oneou)) 
							{
								//positives - negatives should be == closing soh/physical

								let sum_pos = 0; //SUM OF begin_bal + qty_received + pos_adj
								let sum_neg = 0; //SUM OF qty_dispensed + neg_adj
								let clos_bal = 0; //PHY_COUNT

								let begin_bal = 0;
								let qty_received = 0;
								let pos_adj = 0;
								let qty_disp = 0;
								let neg_adj = 0;


								//-----------JUMUIA----------------
								//-----------begbal----------------
								let begin_bal_val = 0;
								let opening_balance = 0;
								if(process.env.REACT_APP_ENV == "dev")
								{
									opening_balance = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[2] == oneou && one_ob_row[0] == begbal_code)[0] || [null, null, null, null];
								}
								else
								{
									opening_balance = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[1] == oneou && one_ob_row[0] == begbal_code)[0] || [null, null, null, null];
								}
								
								if (opening_balance != undefined || opening_balance != null) {
									if (opening_balance[3] == undefined || opening_balance[3] == null) {
										begin_bal_val = 0;
									} else {
										begin_bal_val = opening_balance[3];
									}
								} else {
									begin_bal_val = 0;
								}
								//-----------begbal----------------
								//-----------qty_received----------------
								let qty_received_val = 0;
								let qty_receiveds = 0;
								if(process.env.REACT_APP_ENV == "dev")
								{
									qty_receiveds = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[2] == oneou && one_ob_row[0] == qty_recv_code)[0] || [null, null, null, null];
								}
								else
								{
									qty_receiveds = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[1] == oneou && one_ob_row[0] == qty_recv_code)[0] || [null, null, null, null];
								}
								if (qty_receiveds != undefined || qty_receiveds != null) {
									if (qty_receiveds[3] == undefined || qty_receiveds[3] == null) {
										qty_received_val = 0;
									} else {
										qty_received_val = qty_receiveds[3];
									}
								} else {
									qty_received_val = 0;
								}
								//-----------qty_received----------------
								//-----------pos_adj----------------
								let pos_adj_val = 0;
								let pos_adjs = 0;
								if(process.env.REACT_APP_ENV == "dev")
								{
									pos_adjs = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[2] == oneou && one_ob_row[0] == pos_adj_code)[0] || [null, null, null, null];
								}
								else
								{
									pos_adjs = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[1] == oneou && one_ob_row[0] == pos_adj_code)[0] || [null, null, null, null];
								}
								if (pos_adjs != undefined || pos_adjs != null) {
									if (pos_adjs[3] == undefined || pos_adjs[3] == null) {
										pos_adj_val = 0;
									} else {
										pos_adj_val = pos_adjs[3];
									}
								} else {
									pos_adj_val = 0;
								}
								//-----------pos_adj----------------

								//-----------qty_disp----------------
								let qty_disp_val = 0;
								let qty_disps = 0;
								if(process.env.REACT_APP_ENV == "dev")
								{
									qty_disps = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[2] == oneou && one_ob_row[0] == qty_disp_code)[0] || [null, null, null, null];
								}
								{
									qty_disps = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[1] == oneou && one_ob_row[0] == qty_disp_code)[0] || [null, null, null, null];
								}
								if (qty_disps != undefined || qty_disps != null) {
									if (qty_disps[3] == undefined || qty_disps[3] == null) {
										qty_disp_val = 0;
									} else {
										qty_disp_val = qty_disps[3];
									}
								} else {
									qty_disp_val = 0;
								}
								//-----------qty_disp----------------
								//-----------neg_adj----------------
								let neg_adj_val = 0;
								let neg_adjs = 0;
								if(process.env.REACT_APP_ENV == "dev")
								{
									neg_adjs = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[2] == oneou && one_ob_row[0] == neg_adj_code)[0] || [null, null, null, null];
								}
								else
								{
									neg_adjs = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[1] == oneou && one_ob_row[0] == neg_adj_code)[0] || [null, null, null, null];
								}
								if (neg_adjs != undefined || neg_adjs != null) {
									if (neg_adjs[3] == undefined || neg_adjs[3] == null) {
										neg_adj_val = 0;
									} else {
										neg_adj_val = neg_adjs[3];
									}
								} else {
									neg_adj_val = 0;
								}
								//-----------neg_adj----------------

								//-----------phy_count----------------
								let phy_count_val = 0;
								let phy_counts = 0;
								if(process.env.REACT_APP_ENV == "dev")
								{
									phy_counts = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[2] == oneou && one_ob_row[0] == phy_count_code)[0] || [null, null, null, null];
								}
								else
								{
									phy_counts = reply.fetchedData.rows.filter(one_ob_row => one_ob_row[1] == oneou && one_ob_row[0] == phy_count_code)[0] || [null, null, null, null];
								}
								if (phy_counts != undefined || phy_counts != null) {
									if (phy_counts[3] == undefined || phy_counts[3] == null) {
										phy_count_val = 0;
									} else {
										phy_count_val = phy_counts[3];
									}
								} else {
									phy_count_val = 0;
								}
								//-----------phy_count----------------

								sum_pos = parseFloat(begin_bal_val) + parseFloat(qty_received_val) + parseFloat(pos_adj_val)
								sum_neg = parseFloat(qty_disp_val) + parseFloat(neg_adj_val)
								//-----------JUMUIA----------------


								let difference = sum_pos - sum_neg;
								if (sum_neg != null && sum_pos != null) {
									if (parseFloat(difference) === parseFloat(phy_count_val)) {
										compliant_facility_count = compliant_facility_count + 1;
										nodisc_facilities_names.push(reply.fetchedData.metaData.items[oneou].name);
										nodisc_facilities_codes.push(oneou);
										let nodisctbl_row = [];
										nodisctbl_row.push(reply.fetchedData.metaData.items[oneou].name)
										nodisctbl_row.push(<MFLcell dhis_code={oneou} />)
										// nodisctbl_row.push(sum_neg+'  && Diff: '+difference+' && Clos_Bal: '+clos_bal);
										noDiscrepancy.push(nodisctbl_row);
									}
								}
							} 
							//end valid ous

						});

						reply.fetchedData.metaData.dimensions.ou.map(oneou => {
							if (!nodisc_facilities_codes.includes(oneou) && validOUs.includes(oneou)) {
								disc_facilities_codes.push(<MFLcell dhis_code={oneou} />);
								disc_facilities_names.push(reply.fetchedData.metaData.items[oneou].name);
								let disctbl_row = []
								disctbl_row.push(reply.fetchedData.metaData.items[oneou].name)
								disctbl_row.push(<MFLcell dhis_code={oneou} />)
								withDiscrepancy.push(disctbl_row)
							}
						})

						//
						let total_facils = parseFloat(disc_facilities_codes.length) + parseFloat(nodisc_facilities_codes.length);
						let tot_nodisc = (parseFloat(nodisc_facilities_codes.length) * 100) / total_facils;
						let tot_disc = (parseFloat(disc_facilities_codes.length) * 100) / total_facils;
						//
						let with_discrepancy_number = tot_disc;
						let no_discrepancy_number = tot_nodisc;
						//&&&&&&&&&&&&&&&&&&&&&

						setNoDiscrepancy(noDiscrepancy)

						setWithDiscrepancy(withDiscrepancy)

						let subtitle = reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.dx[0]].name
						pie_data.subtitle = subtitle.replace(' Beginning Balance', '')

						pie_data.eq_title = "No discrepancy"
						pie_data.eq = no_discrepancy_number

						pie_data.n_eq_title = "With discrepancy"
						pie_data.n_eq = with_discrepancy_number

						pie_data.month1 = reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.pe[0]].name
						pie_data.month2 = reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.pe[0]].name
						updateSummaryData(pie_data, null, null, null);
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
						console.log("Cancelling fetchDQConsistency requests");
					}
				});
		} catch (er) {
			setErr({ error: true, msg: 'Error fetching data: \n' + er.message });
		}
	};

	const onUrlChange = base_url => {
		props.history.listen((location, action) => {
			if (location.pathname == paige.route) {
				let new_filter_params = queryString.parse(location.hash);
				
				if (
					new_filter_params.pe.includes(';')
				) {
					setPrd("LAST_MONTH");
				}
				if (
					new_filter_params.pe == '~' ||
					new_filter_params.pe == '' ||
					new_filter_params.pe == null
				) {
					setPrd("LAST_MONTH");
				}
				if (
					new_filter_params.pe != '~' ||
					new_filter_params.pe != '' ||
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
					setOulvl(5); //new_filter_params.level
				}
				let n_b_url = sessionStorage.getItem('current_commodity');
				//let n_b_url = commodity_url || base_url
				let new_url = filterUrlConstructor(
					new_filter_params.pe,
					new_filter_params.ou,
					5,
					n_b_url
				);
				fetchDQConsistency(new_url);
			}
		});
	};

	useEffect(() => {
		let mounted = true
		if (mounted) {
			fetchDQConsistency(url);
			onUrlChange(base_rr_url);
			getValidOUs().then(vo => {
				let vFlS = JSON.parse(localStorage.getItem('validOUs'));
				if (vFlS && vFlS.length < 1) {
					setValidOUs(vo);
				}
			});
		}
		return () => {
			mounted = false
			console.log(`DQ:Consistency aborting requests...`);
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
								let new_pe = filter_params.pe || prd
								fetchDQConsistency(
									filterUrlConstructor(
										new_pe,
										filter_params.ou,
										5,
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
					<>
						<Grid item container lg={12} md={12} xl={12} xs={12} justify="center">
							<Grid item lg={12} md={12} xl={12} xs={12}>
								<PieChart data={summaryData} title='Internal data consistency' />
							</Grid>
						</Grid>
						<br />
						<Grid item container lg={12} md={12} xl={12} xs={12}>
							<Grid item lg={6} md={6} xl={6} xs={12} className="p-5">
								<Table
									pageTitle={`With discrepancies (${withDiscrepancy.length})`}
									theads={['Name', 'Code']}
									rows={withDiscrepancy}
									loading={false}
								/>
							</Grid>
							<Grid item lg={6} md={6} xl={6} xs={12} className="p-5">
								<Table
									pageTitle={`No discrepancy (${noDiscrepancy.length})`}
									theads={['Name', 'Code']}
									rows={noDiscrepancy}
									loading={false}
								/>
							</Grid>
						</Grid>
					</>
				)}
			</div>
		</div>
	);
};

export default DQConsistency;
