import { programs } from 'hcd-config';
const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const endpts = activProg.endpoints;

const ouLevels = [
    { id: 1, name: 'National level' },
    { id: 2, name: 'County level' },
    { id: 3, name: 'Subcounty level' },
    { id: 4, name: 'Ward level' },
    { id: 5, name: 'Facility level' },
    { id: 6, name: 'Community unit level' }
];

const defaultPeriod = period_to_workwith => {
    let d_ate;
    if (
        period_to_workwith &&
        period_to_workwith.length == 6 &&
        !period_to_workwith.includes(';')
    ) {
        let filt_yr = period_to_workwith.substr(0, 4);
        let filt_mn = period_to_workwith.substr(4, 6);
        let date_to_workwith = filt_yr + '-' + filt_mn + '-01';
        d_ate = new Date(date_to_workwith);
    } else if (period_to_workwith && period_to_workwith.includes(';')) {
        return period_to_workwith;
    } else {
        d_ate = new Date();
    }
    let curr_yr = d_ate.getFullYear();
    let curr_mnth = d_ate.getMonth() + 1;
    if (curr_mnth < 1) {
        curr_mnth = 12;
        curr_yr = parseFloat(curr_yr) - 1;
    }
    if (curr_mnth < 10) {
        curr_mnth = '0' + curr_mnth;
    }
    let curr_prd = curr_yr + '' + curr_mnth;

    let past_mnth = parseFloat(curr_mnth) - 1;
    let past_yr = curr_yr;
    if (past_mnth < 1) {
        past_mnth = 12;
        past_yr = parseFloat(past_yr) - 1;
    }
    if (past_mnth < 10) {
        past_mnth = '0' + past_mnth;
    }
    let past_prd = past_yr + '' + past_mnth;
    return past_prd + ';' + curr_prd;
};

const filterUrlConstructor = (pe, ou, lvl, baseUrl) => {
    /* construct URL upon filter. Passing in selected PE & OU. Pick defaults if none passed */
    /* defaults always = '~' */
    let period = pe != null && pe != '' ? pe : '~';
    let lev = lvl != null && lvl != '' ? lvl : '~';
    let ounit = ou != null && ou != '' ? ou : '~';
    let url = baseUrl;
    // if (!baseUrl.includes('dataStore')) {
    // if (process.env.REACT_APP_ENV == 'dev') {
    // if (true) {
    url = `${baseUrl}/${ounit}/${lev}/${period}`;
    if (process.env.REACT_APP_ENV == 'dev') {
        url = `${baseUrl}/${ounit}/${lev}/${period}`;
    } else {
        if (
            period == '' ||
            period == null ||
            period == undefined ||
            period == '~'
        ) {
            period = 'LAST_MONTH';
        }
        if (ounit == '' || ounit == null || ounit == undefined || ounit == '~') {
            ounit = 'HfVjCurKxh2';
        }
        if (lev == '' || lev == null || lev == undefined || lev == '~') {
            lev = '';
        }
        url = `${baseUrl}&dimension=ou:${ounit}${lev != '~' && lev != null && lev != '' ? ';LEVEL-' + lev : ''
            }&dimension=pe:${period}`;
    }
    // }
    return url;
};

const abortRequests = new AbortController();
let justFetch = async (endpoint, postoptions) => {
    // console.log(`justFetch..ing, endpoint=${endpoint} && postoptions=${JSON.stringify(postoptions)} && env=${process.env.REACT_APP_ENV}`);
    if (endpoint == null || endpoint.length < 4) {
        return { error: true, type: 'url', message: 'Invalid endpoint URL' };
    }
    if (
        endpoint.search('dataStore') < 1 &&
        process.env.REACT_APP_ENV != 'dev' &&
        process.env.REACT_APP_ENV != 'development' &&
        endpoint.search('hiskenya.org') > 0
    ) {
        //do not append this for dataStore requests
        endpoint += '&displayProperty=NAME&outputIdScheme=UID';
    }
    let options = postoptions || {};
    let req_method = options.method || 'GET'; //PUT //POST //DELETE etc.
    let req_hd = {};
    let headers = {
        "Accept": "application/json",
    };
    let abortSig = postoptions.signal || abortRequests.signal;
    if (
        process.env.REACT_APP_ENV == 'dev' &&
        endpoint.search('hiskenya.org') > 0
    ) {
        headers.authorization =
            'Basic ' +
            Buffer.from(
                process.env.DHIS_USERNAME + ':' + process.env.DHIS_PASSWORD
            ).toString('base64');
    }
    req_hd.headers = headers;
    req_hd.method = req_method;

    if (req_method != 'GET') {
        req_hd.body = JSON.stringify(options.body); //Stringify here, not in source
    }
    //add prog to urlQ
    if (endpoint.search('hiskenya.org') < 1) {
        let ur_l = new URL(endpoint);
        let prog_params = { program: localStorage.getItem('program') || 1 };
        ur_l.search = new URLSearchParams(prog_params).toString();
        endpoint = ur_l;
    }
    //body for POST/PUT requests

    try {
        let result = await fetch(endpoint, { req_hd, signal: abortSig });
        let result_json = await result.json();
        if (result_json.status === 'ERROR') {
            throw result_json;
        }
        if (process.env.REACT_APP_ENV != "dev" && process.env.REACT_APP_ENV != "development") {
            let rslt = {}
            rslt.fetchedData = result_json
            return rslt
        }
        return result_json;
    } catch (err) {
        return { error: true, msg: err.message };
    }
};

// const isArray = arr => Array.isArray(arr)//typeof arr == "object"

const getValidOUs = async () => {
    let url = endpts.find(ep => ep.name == 'Facilities assigned form')[
        process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url'
    ];
    if (localStorage.getItem('validOUs')) {
        return localStorage.getItem('validOUs');
    }
    return justFetch(url, { signal: abortRequests.signal })
        .then(reply => {
            let vous = [];
            let validOUs = reply.fetchedData.dataSets[0].organisationUnits;
            validOUs.map(ovou => {
                vous.push(ovou.id);
            });
            if (validOUs.length > 1 && !localStorage.getItem('validOUs')) {
                localStorage.setItem('validOUs', JSON.stringify(vous));
            }
            return vous;
        })
        .catch(err => {
            if (abortRequests.signal.aborted) {
                //if(err.name !== "AbortError"){
                return {
                    error: true,
                    msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == 'dev' ? err.message : ''
                        }`
                };
            } else {
                console.log('Cancelled getValidOUs request');
            }
        });
};

const getMflCode = dhis_id => {
    if (localStorage.getItem('mflCodes')) {
        return (
            JSON.parse(localStorage.getItem('mflCodes')).find(mc => mc.id === dhis_id)
                .code || dhis_id
        );
    } else {
        return getAllMflCodes().then(
            reply => reply.find(rp => rp.id === dhis_id).code || dhis_id
        );
    }
};

const getAllMflCodes = async () => {
    let url = endpts.find(ep => ep.name == 'MFL codes')[
        process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url'
    ];
    if (localStorage.getItem('mflCodes')) {
        return localStorage.getItem('mflCodes');
    }
    return justFetch(url, { signal: abortRequests.signal })
        .then(reply => {
            let mflCodes = reply.fetchedData.organisationUnits;
            if (mflCodes.length > 1 && !localStorage.getItem('mflCodes')) {
                localStorage.setItem('mflCodes', JSON.stringify(mflCodes));
            }
            return mflCodes;
        })
        .catch(err => {
            if (abortRequests.signal.aborted) {
                //if(err.name !== "AbortError"){
                return {
                    error: true,
                    msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == 'dev' ? err.message : ''
                        }`
                };
            } else {
                console.log('Cancelled getAllMflCodes request');
            }
        });
};

const getExpectedReports = async (ou, pe) => {
    if (ou == null || ou == '') {
        ou = '~';
    }
    if (pe == null || pe == '') {
        pe = '~';
    }
    let url;
    if (process.env.REACT_APP_ENV == 'dev') {
        //url = endpts.find(ep => ep.name == 'Expected Reports').local_url;
        url = filterUrlConstructor(
            pe,
            ou,
            '~',
            endpts.find(ep => ep.name == 'Expected Reports').local_url
        );
    } else {
        url = filterUrlConstructor(
            pe,
            ou,
            '~',
            endpts.find(ep => ep.name == 'Expected Reports').url
        );
    }
    return justFetch(url, { signal: abortRequests.signal })
        .then(reply => {
            return parseInt(reply.fetchedData.rows[0][3]);
        })
        .catch(err => {
            if (abortRequests.signal.aborted) {
                //if(err.name !== "AbortError"){
                return {
                    error: true,
                    msg: `Error fetching data: ' ${process.env.REACT_APP_ENV == 'dev' ? err.message : ''
                        }`
                };
            } else {
                console.log('Cancelled getExpectedReports request');
            }
        });
};

const findPeriodRange = drange => {
    let date_range_string = '';
    let startDate =
        drange[0].substring(0, 4) + '-' + drange[0].substring(4) + '-01';
    let endDate =
        drange[drange.length - 1].substring(0, 4) +
        '-' +
        drange[drange.length - 1].substring(4) +
        '-01';
    let full_dates_arr = dateRange(startDate, endDate);
    full_dates_arr.map(onedate => {
        let adate = onedate.split('-');
        date_range_string += adate[0] + adate[1] + ';';
    });
    return date_range_string;
};

const dateRange = (startDate, endDate) => {
    let start = startDate.split('-');
    let end = endDate.split('-');
    let startYear = parseInt(start[0]);
    let endYear = parseInt(end[0]);
    let dates = [];

    for (let i = startYear; i <= endYear; i++) {
        let endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
        let startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
        for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
            let month = j + 1;
            let displayMonth = month < 10 ? '0' + month : month;
            dates.push([i, displayMonth, '01'].join('-'));
        }
    }
    return dates;
};

const humanizePe = pe => {
    let ledate = '' + pe;
    let yer = ledate.substr(0, 4);
    let lemonth = ledate.substr(4, 5);
    let mont = '';
    if (lemonth == '01') {
        mont = 'Jan';
    }
    if (lemonth == '02') {
        mont = 'Feb';
    }
    if (lemonth == '03') {
        mont = 'Mar';
    }
    if (lemonth == '04') {
        mont = 'Apr';
    }
    if (lemonth == '05') {
        mont = 'May';
    }
    if (lemonth == '06') {
        mont = 'Jun';
    }
    if (lemonth == '07') {
        mont = 'Jul';
    }
    if (lemonth == '08') {
        mont = 'Aug';
    }
    if (lemonth == '09') {
        mont = 'Sept';
    }
    if (lemonth == '10') {
        mont = 'Oct';
    }
    if (lemonth == '11') {
        mont = 'Nov';
    }
    if (lemonth == '12') {
        mont = 'Dec';
    }
    let lenudate = mont + ' ' + yer;
    return lenudate;
};

const sanitizeStrings = str => {
    const array_of_faff = [
        'HIV-',
        'PMI_',
        'MOS',
        'FP_',
        'MoS',
    ]
    let s_tr = str
    array_of_faff.map(aof => s_tr = s_tr.replace(aof, ''))
    return s_tr
}

export {
    ouLevels,
    filterUrlConstructor,
    getValidOUs,
    getExpectedReports,
    findPeriodRange,
    humanizePe,
    justFetch,
    defaultPeriod,
    getAllMflCodes,
    getMflCode,
    sanitizeStrings
    //   isArray
};
