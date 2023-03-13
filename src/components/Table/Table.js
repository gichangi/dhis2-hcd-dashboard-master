import React, { useState } from 'react';
import clsx from 'clsx';
import PerfectScrollbar from 'react-perfect-scrollbar';
import makeStyles from '@material-ui/styles/makeStyles';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import MUIDataTable from "mui-datatables";

import {getMflCode} from 'common/utils';

const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: 0
  },
  inner: {
    minWidth: '100%'
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const Table = props => {
  let { className, theads, rows, pageTitle, loading, ...rest } = props;

  if(loading == "true"){loading = true}
  if(loading == "false"){loading = false}

  if(pageTitle == undefined || pageTitle == null ){
    pageTitle = ''
  }

  const classes = useStyles();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  
  const handlePageChange = (event, page) => {
    setPage(page);
  };

  const handleRowsPerPageChange = event => {
    setRowsPerPage(event.target.value);
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)} >
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <MUIDataTable
              title={pageTitle} 
              data={rows} 
              columns={theads} 
              options={{
                rowsPerPage: 40,
                rowsPerPageOptions: [10,20,30,40,50],
                selectableRows: false,
                onDownload: (buildHead, buildBody, columns, data)=>{
                  let nu_data = []
                  data.map(ro_ws=>{
                    let nu_rows = {}
                    nu_rows.index = ro_ws.index
                    nu_rows.data = []
                    ro_ws.data.map(r_one=>{
                      if(typeof r_one == "string" || typeof r_one == "number"){
                        nu_rows.data.push(r_one)
                      }else if(typeof r_one == "object"){
                        let pfx = r_one?.props?.prefix || ""
                        let v_al = r_one?.props?.val || ""
                        let sfx = r_one?.props?.suffix || ""
                        if(r_one?.props?.dhis_code && r_one?.props?.dhis_code.length > 2){
                          v_al = getMflCode(r_one?.props?.dhis_code) || r_one?.props?.dhis_code || ""
                        }
                        nu_rows.data.push(pfx+v_al+sfx)
                      }
                    })
                    nu_data.push(nu_rows)
                  })
                  return "\uFEFF" + buildHead(columns) + buildBody(nu_data);
                },
                customRowRender: (datae, ky) => {
                  return (
                    <tr key={ky} className="MuiTableRow-root MUIDataTableBodyRow-root-345 MUIDataTableBodyRow-hover-346 MUIDataTableBodyRow-responsiveStacked-348 MuiTableRow-hover">
                      {datae.map((one_r,inx)=>{
                        let clss = "cell-normal"
                        let val = one_r
                        if(typeof one_r === "object" && one_r?.type?.name == "ShadedCell"){
                          clss = one_r.props.classes.split(" ")[1]
                          val = one_r?.props?.val
                        }
                        if( !isNaN(val) ){
                          val = new Intl.NumberFormat().format(val)
                        }
                        return (
                          <td key={inx} className={"MuiTableCell-root MuiTableCell-body MUIDataTableBodyCell-root-349 MUIDataTableBodyCell-stackedCommon-351 MUIDataTableBodyCell-responsiveStackedSmall-353 "+clss} style={{ color: '#111111', fontWeight: 'semibold'}}> {
                            val
                          } </td>
                        )
                      })}
                    </tr>
                  );
                }
              }} 
            />
          </div>
        </PerfectScrollbar>
      </CardContent>
      <CardActions className={classes.actions}>
      </CardActions>
    </Card>
  );
};


export default Table;
