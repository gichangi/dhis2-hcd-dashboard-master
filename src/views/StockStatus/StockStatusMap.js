import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip } from 'react-leaflet'
import makeStyles from '@material-ui/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Message from 'components/Message/Message';
import {
    filterUrlConstructor,
    getValidOUs,
    justFetch
} from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import MapData from 'common/maps/counties.min.json'
import MapCenters from 'common/maps/county-centers-coordinates.json'

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
//const paige = activProg.pages.filter(ep => ep.page == 'Stock status').pop();
const paige = activProg.pages.filter(ep => ep.page == "Stock status map")[0];
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

const StockStatusMap = props => {
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
            '', //filter_params.ou,
            '2', //filter_params.level,
            endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]
        )
    );
    
    const [sdata, setSSData] = useState([null]);
    const [prd, setPrd] = useState(null);
    const [validOUs, setValidOUs] = useState(
        JSON.parse(localStorage.getItem('validOUs'))
    );
    const [oun, setOun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [oulvl, setOulvl] = useState(null);
    const [err, setErr] = useState({ error: false, msg: '' });
    let title = `Stock Status: All commodities`;

    const updateData = (rws, priod, ogu, levl) => {
        // console.log(`updateData = pe: ${prd}, ou:${oun}, lv:${oulvl}`)
        setSSData(rws);
        // setPrd(priod)
        // setOun(ogu)
        // setOulvl(levl)
    };
    let fetchAll = async the_url => {
        setLoading(true);
        setSSData([null]);
        try {
            //   fetch(the_url, { signal: abortRequests.signal })
            justFetch(the_url, { signal: abortRequests.signal })
                // .then(s_p => s_p.json())
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
                        let mapData = []
                        reply.fetchedData.metaData.dimensions.ou.map(ou_ => {
                            let one_county = {}
                            one_county.id = ou_
                            one_county.name = reply.fetchedData.metaData.items[ou_].name
                            one_county.data = []
                            let dx_2 = reply.fetchedData.metaData.dimensions.dx.slice(reply.fetchedData.metaData.dimensions.dx.length/2)
                            
                            reply.fetchedData.metaData.dimensions.dx.slice(0,reply.fetchedData.metaData.dimensions.dx.length/2).map((dx_,dx_inx) => {
                                
                                let dxrws = reply.fetchedData.rows.find(rw => rw[reply.fetchedData.headers.findIndex(jk => jk.name == "dx")] === dx_ && rw[reply.fetchedData.headers.findIndex(jk => jk.name == "ou")] === ou_)
                                let dxsoh = reply.fetchedData.rows.find(rw => rw[reply.fetchedData.headers.findIndex(jk => jk.name == "dx")] === dx_2[dx_inx] && rw[reply.fetchedData.headers.findIndex(jk => jk.name == "ou")] === ou_)
                               
                                if (dxsoh) {
                                    one_county.data.push({
                                        "name": reply.fetchedData.metaData.items[dxsoh[reply.fetchedData.headers.findIndex(jk => jk.name == "dx")]].name.replace('MOH 743 Rev2020_', '').replace('HCD - ', '').replace(' - HF', '').replace('HIV-', '').replace('HCD - ', '').replace(' - HF', '').replace('MOH 743', '').replace('Rev2020_', '').replace('PMI', '').replace('_', ' ').replace('MoH 730B', '')
                                            .replace('TB/ HIV DRUGS ', '')
                                            .replace('Revision 2017', '')
                                            .replace('MCD_', '')
                                            .replace('MOH 647', '')
                                            .replace('Medicines for OIs ', '')
                                            .replace('MOS', '')
                                            .replace('MoS', '')
                                            .replace('FP_', '')
                                            .replace('FP', '')
                                            .replace('HIV-', '')
                                            .replace('MoS', '')
                                            .replace('MCD', '')
                                            .replace(', FP', '')
                                            .replace('Revision', '')
                                            .replace('2016', '')
                                            .replace('2017', '')
                                            .replace('2018', '')
                                            .replace('2019', '')
                                            .replace('2020', '')
                                            .replace('Adjusted Consumption', '')
                                            .replace('HF', '')
                                            .replace('Paediatric preparations', '')
                                            .replace('Adult preparations', '')
                                            .replace('End of Month', '')
                                            .replace('Physical Stock Count', '')
                                            .replace('MOH 647_', '')
                                            .replace('MOH 743 Rev2020_', '')
                                            .replace('Physical Count', '')
                                            .replace('Ending Balance', '')
                                            .replace('Closing Balance', '') || dxsoh[0],
                                        "period": reply.fetchedData.metaData.items[dxsoh[reply.fetchedData.headers.findIndex(jk => jk.name == "pe")]].name || dxsoh[reply.fetchedData.headers.findIndex(jk => jk.name == "pe")],
                                        "amc": (
                                            !isNaN(
                                                    parseFloat(dxrws[reply.fetchedData.headers.findIndex(jk => jk.name == "value")])
                                                ) 
                                                ? parseFloat(dxrws[reply.fetchedData.headers.findIndex(jk => jk.name == "value")]) 
                                                : 0
                                        ),
                                        "mos": (
                                            !isNaN(
                                                    parseFloat(dxsoh[reply.fetchedData.headers.findIndex(jk => jk.name == "value")])
                                                ) 
                                                ? parseFloat(dxsoh[reply.fetchedData.headers.findIndex(jk => jk.name == "value")]) 
                                                : 0
                                        )
                                    })
                                }
                            })
                            mapData.push(one_county)
                        })
                        setErr({ error: false, msg: '' });

                        updateData(
                            mapData,
                            reply.fetchedData.metaData.items[
                                reply.fetchedData.metaData.dimensions.pe[0]
                            ].name,
                            '',
                            '2'
                        );
                    }
                    setLoading(false);
                })
                .catch(err => {
                    if (abortRequests.signal.aborted) { //if(err.name !== "AbortError"){
                        setLoading(false);
                        setErr({ error: true, msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == "dev" ? err.message : ""}` });
                    } else {
                        console.log("Cancelling fetchAll requests");
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
                // if (
                // 	new_filter_params.ou != '~' &&
                // 	new_filter_params.ou != '' &&
                // 	new_filter_params.ou != null
                // ) {
                // 	setOun(new_filter_params.ou);
                // }
                // if (
                // 	new_filter_params.level != '~' &&
                // 	new_filter_params.level != '' &&
                // 	new_filter_params.level != null
                // ) {
                // 	setOulvl('2')//new_filter_params.level);
                // }
                let new_url = filterUrlConstructor(
                    new_filter_params.pe,
                    '',//new_filter_params.ou,
                    '2',//new_filter_params.level,
                    base_url
                );
                setUrl(new_url)
                fetchAll(new_url);
            }
        });
    };

    useEffect(() => {
        let mounted = true
        if (mounted) {
            onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url" : "url"]);
            fetchAll(url);
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
            console.log(`SSMap:All aborting requests...`);
            abortRequests.abort();
        };
    }, []);
    
    return (
        <div className={classes.root}>
            <Toolbar
                className={classes.gridchild}
                title={title}
                pe={prd}
                ou={''}
                lvl={oulvl}
                filter_params={filter_params}
            />
            <div className={classes.content}>
                {err.error ? (
                    <Message severity="error">{err.msg}</Message>
                ) : <>
                    {/* <a href={url} rel="noreferrer noopener" target="_blank">{url}</a><hr/>{JSON.stringify(sdata,' ',2)} */}
                    <div id="ssMap">
                        <>
                            <MapContainer center={[0.218389, 37.817222]} zoom={7.49} maxZoom={9.00} scrollWheelZoom={false}>
                                <TileLayer
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <GeoJSON data={MapData} style={`color: '#006400'; weight: 5; opacity: 0.65;`} />
                                {(sdata != null && sdata.length > 0 && sdata[0] != null) ? sdata.map(sd =>
                                    <Marker key={sd?.id} position={[MapCenters.find(mc => mc.dhis_id == sd.id)?.latitude, MapCenters.find(mc => mc.dhis_id == sd.id)?.longitude]}>
                                        <Popup >
                                            <Typography variant="h4" align="center">{sd.name.toUpperCase()}</Typography>
                                            <div style={{ height: '300px', overflowY: 'auto', }}>
                                                <table border={0} cellSpacing={0} cellPadding={0}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ padding: '2px', borderBottom: '1px solid #888' }}>Commodity</th>
                                                            <th style={{ padding: '2px', borderBottom: '1px solid #888' }}>Period</th>
                                                            <th style={{ padding: '2px', borderBottom: '1px solid #888' }}>AMC</th>
                                                            <th style={{ padding: '2px', borderBottom: '1px solid #888' }}>MOS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sd.data.map(tr => <tr key={tr.name}>
                                                            <td style={{ padding: '2px', borderBottom: '1px solid #888' }}>{tr.name}</td>
                                                            <td style={{ padding: '2px', borderBottom: '1px solid #888' }}>{tr.period}</td>
                                                            <td style={{ padding: '2px 4px', borderBottom: '1px solid #888', textAlign: 'right', fontWeight: 'bold' }}>{tr.amc}</td>
                                                            <td style={{ padding: '2px 4px', borderBottom: '1px solid #888', textAlign: 'right', fontWeight: 'bold' }}>{(tr.mos).toFixed(1) || 0}</td>
                                                        </tr>)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ) : ""}
                            </MapContainer>
                        </>
                    </div>

                </>
                }
            </div>
        </div>
    );
};

export default StockStatusMap;
