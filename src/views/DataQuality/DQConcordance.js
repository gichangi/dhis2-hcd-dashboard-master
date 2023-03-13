import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Message from 'components/Message/Message';
import { filterUrlConstructor, getValidOUs, justFetch, defaultPeriod } from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import PieChart from './components/PieChart/PieChart';
import Table from 'components/Table/Table';
import MFLcell from 'components/Table/MFLcell';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Data Quality: Concordance')[0];
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

const DQConcordance = props => {
	const classes = useStyles();

	let filter_params = queryString.parse(props.location.hash);
	if (
		filter_params.pe == undefined ||
		filter_params.pe == '~' ||
		(filter_params.pe.search(';') <= 0 && periodFilterType == 'range')
	) {
		filter_params.pe = defaultPeriod();
	}
	const base_rr_url = endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"];
	let [url, setUrl] = useState(
		filterUrlConstructor(
			defaultPeriod(),
			filter_params.ou,
			"5", //filter_params.level,
			base_rr_url
		)
	);
	const [validOUs, setValidOUs] = useState(
		JSON.parse(localStorage.getItem('validOUs'))
	);
	const [summaryData, setSummaryData] = useState([]);
	const [openingEqClosing, setOpeningEqClosing] = useState([[]]);
	const [openingNotEqClosing, setOpeningNotEqClosing] = useState([[]]);
	const [prd, setPrd] = useState(defaultPeriod());
	const [oun, setOun] = useState(null);
	const [loading, setLoading] = useState(true);
	const [oulvl, setOulvl] = useState(null);
	const [err, setErr] = useState({ error: false, msg: '' });
	const [commodity_url, setCommodityUrl] = useState(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);
	let title = `Data Quality: Concordance`;

	const updateSummaryData = (rws, priod, ogu, levl) => {
		setSummaryData(rws)
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

	let fetchDQConcordance = async rr_url => {
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
                        if (e_rr.msg.includes('aborted') || e_rr.msg.includes('NetworkError')) {
                            props.history.go(0)
                        }
                        console.error(reply)
					} else {

						///////////////////////////////////////////////////////
						/////////////////////// SC ///////////////////////////
						let pie_data = {};

						let o_eq_c = []	//ounit, id, closbal, openbal
						let o_noteq_c = []	//ounit, id, closbal, openbal
						let flArr = Array.from(reply.fetchedData.metaData.dimensions.pe, p_e_ => parseFloat(p_e_)); let newMonth = Math.max(...flArr); let oldMonth = Math.min(...flArr)
						reply.fetchedData.metaData.dimensions.ou.map(ou => {
							if (validOUs.includes(ou)) 
							{
								if(process.env.REACT_APP_ENV == "dev")
                				{
									let opening_newmonth_row = reply.fetchedData.rows.find(rw => rw[2] == ou && rw[1] == newMonth) || [null, null, null, null]
									let opening_newmonth = opening_newmonth_row[3] || null
									let closing_oldmonth_row = reply.fetchedData.rows.find(rw => rw[2] == ou && rw[1] == oldMonth) || [null, null, null, null]
									let closing_oldmonth = closing_oldmonth_row[3] || null
									let r_ow = [reply.fetchedData.metaData.items[ou].name, <MFLcell dhis_code={ou} />, closing_oldmonth, opening_newmonth]
									if (closing_oldmonth == opening_newmonth && closing_oldmonth != null && opening_newmonth != null) {
										o_eq_c.push(r_ow)
									} else {
										o_noteq_c.push(r_ow)
									}
								}
								else
								{
									let opening_newmonth_row = reply.fetchedData.rows.find(rw => rw[1] == ou && rw[2] == newMonth) || [null, null, null, null]
									let opening_newmonth = opening_newmonth_row[3] || null
									let closing_oldmonth_row = reply.fetchedData.rows.find(rw => rw[1] == ou && rw[2] == oldMonth) || [null, null, null, null]
									let closing_oldmonth = closing_oldmonth_row[3] || null
									let r_ow = [reply.fetchedData.metaData.items[ou].name, <MFLcell dhis_code={ou} />, closing_oldmonth, opening_newmonth]
									if (closing_oldmonth == opening_newmonth && closing_oldmonth != null && opening_newmonth != null) {
										o_eq_c.push(r_ow)
									} else {
										o_noteq_c.push(r_ow)
									}
								}
							}
						})

						setOpeningEqClosing(o_eq_c)

						setOpeningNotEqClosing(o_noteq_c)

						pie_data.month1 = reply.fetchedData.metaData.items[oldMonth].name
						pie_data.month2 = reply.fetchedData.metaData.items[newMonth].name

						pie_data.eq_title = `Opening SOH (${pie_data.month2}) = Closing SOH (${pie_data.month1})`
						pie_data.eq = o_eq_c.length
						let subtitle = reply.fetchedData.metaData.items[reply.fetchedData.metaData.dimensions.dx[0]].name
						pie_data.subtitle = subtitle.replace('Physical Count', '').replace('Opening Balance', '')

						pie_data.n_eq_title = `Opening SOH (${pie_data.month2}) ≠ Closing SOH (${pie_data.month1})`
						pie_data.n_eq = o_noteq_c.length

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
						console.log("Cancelling fetchDQConcordance requests");
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
				if (new_filter_params.pe.length == 6) {
					new_filter_params.pe = defaultPeriod(new_filter_params.pe)
					setPrd(new_filter_params.pe)
				}
				if (new_filter_params.pe.includes("LAST")) {
					new_filter_params.pe = defaultPeriod()
					setPrd(new_filter_params.pe)
				}
				if (
					new_filter_params.pe == '~' ||
					new_filter_params.pe == '' ||
					new_filter_params.pe == null
				) {
					setPrd(defaultPeriod())
					new_filter_params.pe = defaultPeriod()
				}
				if (
					new_filter_params.pe != '~' &&
					new_filter_params.pe != '' &&
					new_filter_params.pe != null &&
					new_filter_params.pe.search(';') > 0
				) {
					setPrd(new_filter_params.pe);
				}
				if (new_filter_params.pe && new_filter_params.pe.search(';') <= 0 && new_filter_params.length > 4) {
					let ofp = new_filter_params.pe
					setPrd(defaultPeriod(ofp));
					new_filter_params.pe = defaultPeriod(ofp);
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
				let n_b_url = sessionStorage.getItem('current_commodity'); //commodity_url || base_url
				console.log('On Change URL: ', n_b_url);
				console.log('On Change URL CMDy: ', commodity_url);
				let new_url = filterUrlConstructor(
					new_filter_params.pe,
					new_filter_params.ou,
					5,
					n_b_url
				);
				fetchDQConcordance(new_url);
			}
		});
	};

	useEffect(() => {
		let mounted = true
		if(mounted){
			fetchDQConcordance(url);
			console.log('Commodity URL',commodity_url);			
			onUrlChange(commodity_url);
			//onUrlChange(base_rr_url);
			getValidOUs().then(vo => {
				let vFlS = JSON.parse(localStorage.getItem('validOUs'));
				if (vFlS && vFlS.length < 1) {
					setValidOUs(vo);
				}
			});
		}
		return () => {
			mounted = false
			console.log(`DQ:Concordance aborting requests...`);
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
								// let new_pe = prd
								// if (filter_params.pe.length == 6) { new_pe = defaultPeriod(filter_params.pe); setPrd(new_pe) }
								// if (!filter_params.pe.includes(';')) { new_pe = defaultPeriod() }
								fetchDQConcordance(
									filterUrlConstructor(
										prd,
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
								<PieChart data={summaryData} title='Opening SOH vs Closing SOH comparison' />
							</Grid>
						</Grid>
						<br />
						<Grid item container lg={12} md={12} xl={12} xs={12}>
							<Grid item lg={6} md={6} xl={6} xs={12} className="p-5">
								<Table
									pageTitle={`Opening Balance NOT equal Closing SOH (${openingNotEqClosing.length})`}
									theads={['Name', 'Code', 'Closing bal.', 'Opening SOH']}
									rows={openingNotEqClosing}
									loading={false}
								/>
							</Grid>
							<Grid item lg={6} md={6} xl={6} xs={12} className="p-5">
								<Table
									pageTitle={`Opening Balance equals Closing SOH (${openingEqClosing.length})`}
									theads={['Name', 'Code', 'Closing bal.', 'Opening SOH']}
									rows={openingEqClosing}
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

export default DQConcordance;
