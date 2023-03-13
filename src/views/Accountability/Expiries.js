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
import ShadedCell from 'components/Table/ShadedCell';
import { ExitStatus } from 'typescript';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Expiries')[0];
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

const Expiries = props => {
	const classes = useStyles();

	let filter_params = queryString.parse(props.location.hash);
	if (
		filter_params.pe &&
		filter_params.pe.search(';') > 0 &&
		periodFilterType != 'range'
	) {
		filter_params.pe = 'LAST_MONTH';
	}
	let [url, setUrl] = useState(
		filterUrlConstructor(
			filter_params.pe,
			filter_params.ou,
			filter_params.level,
			endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]
		)
	);
	const [accdata, setAccData] = useState([['Loading...']]);
	const [prd, setPrd] = useState(null);
	const [oun, setOun] = useState(null);
	const [loading, setLoading] = useState(true);
	const [oulvl, setOulvl] = useState(null);
	const [err, setErr] = useState({ error: false, msg: '' });
	let title = `Expiries`;

	const updateData = (rws, priod, ogu, levl) => {
		setAccData(rws);
		// setPrd(priod)
		// setOun(ogu)
		// setOulvl(levl)
	};


	//////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\
	const filterItems = (array, query) => {
		return array.filter(function (el) {
			return el.indexOf(query) > -1;
		});
	};
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


	let fetchAcc = async the_url => {
		setLoading(true);
		setErr({ error: false, msg: '' });
		setAccData([['Loading...']]);
		try {
			//   fetch(the_url, { signal: abortRequests.signal })
			justFetch(the_url, { signal: abortRequests.signal })
				// .then(s_p => s_p.json())
				.then(reply => {
					// console.log('reply: '+JSON.stringify(reply))
					console.log('accurl: '+the_url)
					if (reply.fetchedData == undefined || reply.fetchedData?.error) {
						setLoading(false)
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
						let tableData = [];
						let thedx = reply.fetchedData.metaData.dimensions.dx;
						let therows = reply.fetchedData.rows;

						// Expiries in 6 months
						let commodities_qrecvd_arr = []; thedx.map(x_ => { if (reply.fetchedData.metaData.items[x_].name.toLowerCase().search('expiry') > 0) { commodities_qrecvd_arr.push(x_) } })
						let commodities_arr = commodities_qrecvd_arr //using this as commodity array
						
						// Adjusted consumption
						let commodities_opsoh_arr = []; thedx.map(x_ => { if (reply.fetchedData.metaData.items[x_].name.toLowerCase().search('adjusted') > 0) { commodities_opsoh_arr.push(x_) } })

						let commodities_id_arr0 = [];
						let commodities_id_arr = [];
						let commodities_name_arr = [];
						commodities_arr.map((co_ar) => {
							commodities_id_arr0 = co_ar.split(".", 2);
							commodities_id_arr.push(commodities_id_arr0[0]);
						});

						commodities_arr.map((coid) => {
							commodities_name_arr.push(
								reply.fetchedData.metaData.items[coid].name.replace('Beginning', '').replace('Balance', '').replace('MOH 647_','').replace('MOH 743 Rev2020_','').replace('.', '').replace('HCD - ', '').replace(' - HF', '').replace('MOH 743', '').replace('Rev2020_', '').replace('PMI', '').replace('_', ' ').replace('MoH 730B', '')
								.replace('TB/ HIV DRUGS ', '')
								.replace('Revision 2017', '')
								.replace('MCD_', '')
								.replace('Medicines for OIs ', '')
								.replace('MOS', '')
								.replace('Rev ', '')
								.replace('MoS', '')
								.replace('FP_', '')
								.replace('HIV-', '')
								.replace('MoS', '')
								.replace(', FP', '')
								.replace('Revision', '')
								.replace('2016', '')
								.replace('2017', '')
								.replace('2018', '')
								.replace('2019', '')
								.replace('2020', '')
								.replace('Paediatric preparations', '')
								.replace('Adult preparations', '')
								.replace('End of Month', '')
								.replace('Physical Stock Count', '')
								.replace('MOH 647_', '')
								.replace('MOH 743 Rev2020_', '')
								.replace('Physical Count', '')
								.replace('Ending Balance', '')
								.replace('Closing Balance', '').trim()
								.replace('Adjusted Consumption - HF', '').trim()
								.replace('Quantity of Commodities with less than 6 months to expiry','').trim()
							);
						});

						reply.fetchedData.metaData.dimensions.ou.map((ou, ou_ix) => {
							let tdata = [];
							let ki_cells = [];
							let rows_filtered_ou = filterItems(therows, ou);
							let opsoh_arr = [];
							let posadj_arr = [];
							let kemsi_arr = [];
							let qtydisp_arr = [];
							let negadj_arr = [];
							let kissue_arr = [];
							let closbal_arr = [];
							let pcacc_arr = [];
							let letiance_arr = [];

							commodities_qrecvd_arr.map((one_ki) => {
								let filt_rows = filterItems(rows_filtered_ou, one_ki);
								if (filt_rows == undefined) {
									filt_rows = [["", "", "", "0.0"]];
									ki_cells.push("0.0");
								} else {
									if (filt_rows[0] == undefined) {
										ki_cells.push("0.0");
									} else {
										ki_cells.push(filt_rows[0][reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);
									}
								}
							});

							commodities_id_arr.map((cidarr, cid_inx) => {
								let trow = []
								let commo_id_indicator_1 = commodities_qrecvd_arr.find(op => op.split('.')[0] == cidarr)
								let commo_id_indicator_2 = commodities_opsoh_arr[cid_inx]; //commodities_opsoh_arr.find(op => op.split('.')[0] == cidarr)
																
								let rows_filtered_ou_commo1 = rows_filtered_ou.filter(rw => rw[0] == commo_id_indicator_1);
								let rows_filtered_ou_commo2 = rows_filtered_ou.filter(rw => rw[0] == commo_id_indicator_2);
								
								trow.push(reply.fetchedData.metaData.items[ou].name)
								trow.push(commodities_name_arr[cid_inx])
								// ----------data cells----------
								let opsoh = filterItems(rows_filtered_ou_commo1, commo_id_indicator_1)[0];
								if (opsoh == undefined) { opsoh = [0, 0, 0, 0]; }
								opsoh_arr.push(opsoh[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);								
								trow.push(parseFloat(opsoh[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]).toFixed(1))

								let posadj = filterItems(rows_filtered_ou_commo2, commo_id_indicator_2)[0];
								if (posadj == undefined) { posadj = [0, 0, 0, 0]; }
								trow.push(parseFloat(posadj[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]).toFixed(1))
								posadj_arr.push(posadj[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);

																
								let expiry_mos = parseFloat(opsoh[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]) / parseFloat(posadj[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);

								if(isNaN(expiry_mos.toFixed(1)))
									trow.push('-')
								else
									trow.push(expiry_mos.toFixed(1))

								// ----------END data cells----------

								tdata.push(trow);
								tableData.push(trow);
							});

							let o_gu;
							if (filter_params.ou) {
								o_gu = filter_params.ou;
							} else {
								o_gu = '';
							}

							commodities_id_arr.map((com_ki, comki_indx) => {
								let kione_val = filterItems(rows_filtered_ou, com_ki[0]);
								if (
									kione_val[0] == undefined ||
									kione_val == undefined ||
									kione_val == null ||
									kione_val == ""
								) {
									kione_val = [0, 0, 0, 0];
								}
								let kione_value
								if (typeof kione_val[0] == "number") {
									kione_value = kione_val[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")];
								} else if (
									typeof kione_val[0] == "array" ||
									typeof kione_val[0] == "object"
								) {
									kione_value = kione_val[0][reply.fetchedData.headers.findIndex(jk=>jk.name=="value")];
								}
								let kione_id2 = ou + "_ki_cell_" + comki_indx;
							});

							const getPerc = () => {
								return kissue_arr;
							}

							updateData(tableData, reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.pe[0]].name, o_gu, oulvl);
							setLoading(false)
						});


						/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
						/// ~~~~~~~~~~~~~~~~~~~~~~ SUCCESS/> ~~~~~~~~~~~~~~~~~~~~~~~~~~
						/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
					}
					setLoading(false);
				})
				.catch(err => {
					if (abortRequests.signal.aborted) { //if(err.name !== "AbortError"){
						setLoading(false);
						setErr({ error: true, msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == "dev" ? err.message : ""}` });
					} else {
						console.log("Cancelling fetchAcc requests");
					}
				});
		} catch (er) {
			setErr({ error: true, msg: `Error fetching data ${process.env.REACT_APP_ENV == "dev" ? er.message : ""}` });
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
					setOulvl(new_filter_params.level);
				}
				let new_url = filterUrlConstructor(
					new_filter_params.pe,
					new_filter_params.ou,
					new_filter_params.level,
					base_url
				);
				fetchAcc(new_url);
			}
		});
	};

	useEffect(() => {
		fetchAcc(url);
		onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);

		return () => {
			console.log(`Acc: aborting requests...`);
			abortRequests.abort();
		};
	}, []);

	let data = {};
	data.theads = [
		'Org. unit',
		'Commodity',
		'Quantities Expiring in 6 Months',
		'AMC',
		'Commodities at Risk of Expiry - MOS'
	];
	data.rows = accdata;
	// console.log('accdata: ', JSON.stringify(accdata))

	return (
		<div className={classes.root}>
			<Toolbar
				className={classes.gridchild}
				title={title}
				pe={prd}
				ou={oun}
				lvl={oulvl}
				filter_params={filter_params}
			/>
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

export default Expiries;
