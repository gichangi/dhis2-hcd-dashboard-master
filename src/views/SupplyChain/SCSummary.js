import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Message from 'components/Message/Message';
import {
	filterUrlConstructor,
	getValidOUs,
	getExpectedReports,
	justFetch
} from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Table from 'components/Table/Table';
import ShadedCell from 'components/Table/ShadedCell';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.name == 'Indicator Summary')[0];
const periodFilterType = paige.periodFilter || null;
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

const SCSummary = props => {
	const classes = useStyles();

	let filter_params = queryString.parse(props.location.hash);
	console.log('Query params: ', filter_params);
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
			endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]
		)
	);
	const [scsummdata, setScSummdata] = useState([['Loading...']]);
	const [prd, setPrd] = useState(null);
	const [validOUs, setValidOUs] = useState(
		JSON.parse(localStorage.getItem('validOUs'))
	);
	const [oun, setOun] = useState(null);
	const [loading, setLoading] = useState(true);
	const [oulvl, setOulvl] = useState(null);
	const [err, setErr] = useState({ error: false, msg: '' });
	let title = `Supply Chain Performance Summary`;

	const updateData = (rws, priod, ogu, levl) => {
		setScSummdata(rws);
		// setPrd(priod)
		// setOun(ogu)
		// setOulvl(levl)
	};



	let fetchHFUnder = async (the_url, filt_pars) => {
		setLoading(true);
		setErr({ error: false, msg: '' });
		setScSummdata([['Loading...']]);
		try {
			justFetch(the_url, { signal: abortRequests.signal })
				.then(reply => {
					setLoading(false)
					getExpectedReports(filt_pars.ou, filt_pars.pe).then((expectedUnitsNo) => {
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
							let tableData = [];
							
							reply.fetchedData.metaData.dimensions.dx.map(entry => {								
								if (entry.includes("REPORTING_RATE") && !entry.includes("REPORTING_RATE_ON_TIME")) {
									let rratecount = 0;
									let rrate = 0;
									reply.fetchedData.rows.map(rentry => {
										let dxid = rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")];										
										let rrval = parseFloat(rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);
										
										if (dxid == entry) 
										{
											rratecount++;
											rrate = rrate + rrval;											
										}
									})
									let acceptable = 95;
									let target = 100;
									// let rrate=(rrate);

									let rrpercent = (rratecount / expectedUnitsNo) * 100;
									let bgc = 'cell-white';
									if (rrpercent >= acceptable) {
										if (rrpercent >= target) {
											bgc = 'cell-green';
										} else {
											bgc = 'cell-amber';
										}
									} else {
										bgc = 'cell-red';
									}

									let trow = [];
									trow.push("Reporting Rate");
									trow.push(reply.fetchedData.metaData.items[entry].name.replace('FP_', '').replace('HIV-', '').replace('MoS', '').replace('MOS', '').trim());
									trow.push(rratecount);
									trow.push(expectedUnitsNo);
									let n_cell = <ShadedCell classes={"cell-fill cell-amber " + bgc} val={rrpercent.toFixed(1)} suffix="%" />
									trow.push(n_cell);
									trow.push(target);
									trow.push(acceptable);
									tableData.push(trow)
								}

								if (entry.includes("REPORTING_RATE_ON_TIME")) {
									let rratecount = 0;
									let rrate = 0;

									reply.fetchedData.rows.map(rentry => {
										let dxid = rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")];
										let rrval = parseFloat(rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);

										if (dxid == entry) {
											rratecount++;
											rrate = rrate + rrval;
										}
									})
									let acceptable = 90;
									let target = 95;
									// let rrate=(rrate);

									let rrpercent = (rratecount / expectedUnitsNo) * 100;

									let bgc = 'cell-white';
									if (rrpercent >= acceptable) {
										if (rrpercent >= target) {
											bgc = 'cell-green';
										} else {
											bgc = 'cell-amber';
										}
									} else {
										bgc = 'cell-red';
									}

									let trow = [];
									trow.push("On Time Reporting");
									trow.push(reply.fetchedData.metaData.items[entry].name.replace('FP_', '').replace('HIV-', '').replace('MoS', '').replace('MOS', '').trim());
									trow.push(rratecount);
									trow.push(expectedUnitsNo);
									let n_cell = <ShadedCell classes={"cell-fill cell-amber " + bgc} val={rrpercent.toFixed(1)} suffix="%" />
									trow.push(n_cell);
									trow.push(target);
									trow.push(acceptable);
									tableData.push(trow)
								}

								if (!entry.includes("REPORTING_RATE") && !entry.includes("REPORTING_RATE_ON_TIME")) {

									let stockok = 0;

									reply.fetchedData.rows.map(rentry => {
										let dxid = rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")];
										let mosval = parseFloat(rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);

										if (dxid == entry) {
											if (mosval >= 3 && mosval <= 6) {
												stockok++;
											}
										}
									})
									let acceptable = 70;
									let target = 90;
									// let stockok=(stockok);
									// let org=(reply.fetchedData.metaData.dimensions.ou.length);
									let okpercent = (stockok / expectedUnitsNo) * 100;

									let bgc = 'cell-white';
									if (okpercent >= acceptable) {
										if (okpercent >= target) {
											bgc = 'cell-green';
										} else {
											bgc = 'cell-amber';
										}
									} else {
										bgc = 'cell-red';
									}

									let trow = [];
									trow.push("Facilities stocked according to plan");
									trow.push(reply.fetchedData.metaData.items[entry].name.replace('FP_', '').replace('HIV-', '').replace('MoS', '').replace('MOS', '').trim());
									trow.push(stockok);
									trow.push(expectedUnitsNo);
									let n_cell = <ShadedCell classes={"cell-fill cell-amber " + bgc} val={okpercent.toFixed(1)} suffix="%" />
									trow.push(n_cell);
									trow.push(target);
									trow.push(acceptable);
									tableData.push(trow)
								}

								if (!entry.includes("REPORTING_RATE") && !entry.includes("REPORTING_RATE_ON_TIME")) {

									let overstock = 0;
									reply.fetchedData.rows.map(rentry => {
										let dxid = rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")];
										let mosval = parseFloat(rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);

										if (dxid == entry) {

											if (mosval > 6) {
												overstock++;
											}
										}
									})
									let acceptable = 15;
									let target = 5;
									// let overOrg=(reply.fetchedData.metaData.dimensions.ou.length);
									// let overstock = (overstock);			
									let overpercent = (overstock / expectedUnitsNo) * 100;

									let bgc = 'cell-white';
									if (overpercent <= acceptable) {
										if (overpercent < target) {
											bgc = 'cell-green';
										} else {
											bgc = 'cell-amber';
										}
									} else {
										bgc = 'cell-red';
									}

									let trow = [];
									trow.push("Facilities over-stocked");
									trow.push(reply.fetchedData.metaData.items[entry].name.replace('FP_', '').replace('HIV-', '').replace('MoS', '').replace('MOS', '').trim());
									trow.push(overstock);
									trow.push(expectedUnitsNo);
									let n_cell = <ShadedCell classes={"cell-fill cell-amber " + bgc} val={overpercent.toFixed(1)} suffix="%" />
									trow.push(n_cell);
									trow.push(target);
									trow.push(acceptable);
									tableData.push(trow)
								}

								if (!entry.includes("REPORTING_RATE") && !entry.includes("REPORTING_RATE_ON_TIME")) {
									let understock = 0;

									reply.fetchedData.rows.map(rentry => {
										let dxid = rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")];
										let mosval = parseFloat(rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);
										if (dxid == entry) {
											if (mosval > 0 && mosval < 3) {
												understock++;
											}
										}
									})
									let acceptable = 15;
									let target = 5;
									// let understock=(understock);
									// let org=(reply.fetchedData.metaData.dimensions.ou.length);
									let underpercent = (understock / expectedUnitsNo) * 100;

									let bgc = 'cell-white';
									if (underpercent <= acceptable) {
										if (underpercent < target) {
											bgc = 'cell-green';
										} else {
											bgc = 'cell-amber';
										}
									} else {
										bgc = 'cell-red';
									}

									let trow = [];
									trow.push("Facilities under-stocked");
									trow.push(reply.fetchedData.metaData.items[entry].name.replace('FP_', '').replace('HIV-', '').replace('MoS', '').replace('MOS', '').replace('MCD_', '')
									.replace(' Adjusted Consumption', '')
									.replace('HCD -', '')
									.replace('MOH 647_', '')
									.replace('- HF', '')
									.replace('MOH', '')
									.replace('_', ' ')
									.replace('743', '')
									.replace('647', '')
									.replace('Rev2020', '')
									.replace('HIV-', '')
									.replace('Physical Count', '')
									.replace('Physical count', '')
									.replace('Beginning', '').replace('Balance', '').replace('MOH 647_', '').replace('.', '').replace('HCD - ', '').replace(' - HF', '').replace('MOH 743', '').replace('Rev2020_', '').replace('PMI', '').replace('_', ' ').replace('MoH 730B', '')
									.replace('TB/ HIV DRUGS ', '')
									.replace('Revision 2017', '')
									.replace('MCD_', '')
									.replace('Medicines for OIs ', '')
									.replace('MOS', '')
									.replace('MoH', '')
									.replace('MOH', '')
									.replace('647', '')
									.replace('743', '')
									.replace('730B', '')
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
									.replace('Closing Balance', '').trim());
									trow.push(understock);
									trow.push(expectedUnitsNo);
									let n_cell = <ShadedCell classes={"cell-fill cell-amber " + bgc} val={underpercent.toFixed(1)} suffix="%" />
									trow.push(n_cell);
									trow.push(target);
									trow.push(acceptable);
									tableData.push(trow)
								}

								if (!entry.includes("REPORTING_RATE") && !entry.includes("REPORTING_RATE_ON_TIME")) {
									let stockout = 0;
									reply.fetchedData.rows.map(rentry => {
										let dxid = rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="dx")];
										let mosval = parseFloat(rentry[reply.fetchedData.headers.findIndex(jk=>jk.name=="value")]);
										if (dxid == entry) {
											if (mosval == 0) {
												stockout++;
											}
										}
									})
									let acceptable = 10;
									let target = 0;
									// let stockout=(stockout);
									// let org=(reply.fetchedData.metaData.dimensions.ou.length);
									let stockoutpercent = (stockout / expectedUnitsNo) * 100;

									let bgc = 'cell-white';
									if (stockoutpercent <= acceptable) {
										if (stockoutpercent < target) {
											bgc = 'cell-green';
										} else {
											bgc = 'cell-amber';
										}
									} else {
										bgc = 'cell-red';
									}

									let trow = [];
									trow.push("Facilities with a stock out");
									trow.push(reply.fetchedData.metaData.items[entry].name.replace('FP_', '').replace('HIV-', '').replace('MoS', '').replace('MOS', '').trim());
									trow.push(stockout);
									trow.push(expectedUnitsNo);
									let n_cell = <ShadedCell classes={"cell-fill cell-amber " + bgc} val={stockoutpercent.toFixed(1)} suffix="%" />
									trow.push(n_cell);
									trow.push(target);
									trow.push(acceptable);
									tableData.push(trow)
								}
							})
							updateData(
								tableData,
								reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.pe[0]].name || filter_params.pe,
								reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.ou[0]].name || filter_params.ou,
								filter_params.level || "~")
						}
						// updateData( tableData, reply.fetchedData.metaData.items[ reply.fetchedData.metaData.dimensions.pe[0] ].name || prd, o_gu, oulvl );
						/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
						/// ~~~~~~~~~~~~~~~~~~~~~~ SUCCESS/> ~~~~~~~~~~~~~~~~~~~~~~~~~~
						/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
						//   }
						setLoading(false);
					})
				})
				.catch(err => {
					if (abortRequests.signal.aborted) { //if(err.name !== "AbortError"){
						setLoading(false);
						setErr({ error: true, msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == "dev" ? err.message : ""}` });
					} else {
						console.log("Cancelling fetchHFUnder requests");
					}
				})
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
				//new_filter_params.level
				let new_url = filterUrlConstructor(
					new_filter_params.pe,
					new_filter_params.ou,
					5,
					base_url
				);

				console.log('Onchange url', new_url);
				fetchHFUnder(new_url, new_filter_params);
			}
		});
	};

	useEffect(() => {
		let mounted = true
		if (mounted) {

			fetchHFUnder(url, { ou: filter_params.ou, pe: filter_params.pe });
			onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);
			getValidOUs().then(vo => {
				let vFlS = JSON.parse(localStorage.getItem('validOUs'));
				if (vFlS && vFlS.length < 1) {
					setValidOUs(vo);
					// localStorage.removeItem('validOUs')
					// console.log("refetching validOUs with getValidOUs")
					// localStorage.setItem('validOUs', JSON.stringify(vo))
				}
			});
		}

		return () => {
			mounted = false
			console.log(`SCP:Summary: aborting requests...`);
			abortRequests.abort();
		};
	}, []);

	let data = {};
	data.theads = [
		'Parameter',
		'Commodity',
		'Numerator',
		'Denominator',
		'Result',
		'Target',
		'Acceptable'
	];
	data.rows = scsummdata;

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

export default SCSummary;
