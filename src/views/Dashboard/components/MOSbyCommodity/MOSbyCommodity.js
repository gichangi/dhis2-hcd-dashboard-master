import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';
import useTheme from '@material-ui/styles/useTheme';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
require('highcharts/modules/exporting')(Highcharts);


const useStyles = makeStyles(() => ({
  root: {},
  chartContainer: {
    minHeight: '500px',
    position: 'relative',
    textAlign: 'center'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const MOSbyCommodity = props => {
  const { className, data, minmax, yminmax, labels, prog, ...rest } = props;
  const theme = useTheme();
  // console.log(`theme: ${JSON.stringify(theme.palette.secondary, '', 1)}`)

  const options = {
    chart: {
      type: 'bar'
    },
    title: {
        text: 'MOS By Commodity'
    },
    // subtitle: {
    //     text: 'Source: HIS Kenya'
    // },
    colors: [theme.palette.secondary.light, theme.palette.secondary.main, theme.palette.secondary.dark],
    exporting: {
        enabled: true
    },
    xAxis: {						
        categories: labels, //['AL6', 'AL12', 'AL18', 'AL24', 'AL all', 'AS inj','SP tabs', 'RDTs'],
        title: {
            text: 'Commodity'
        }
    },
    yAxis: {
        min: yminmax[0],
        max: yminmax[1],
        title: {
            text: 'Months of Stock',
            align: 'high'
        },
        labels: {
            overflow: 'justify'
        },
        plotLines: [{
            color: '#FF0000',
            width: 2,
            value: minmax[0],
            label: {
                text: 'Min',
                align: 'right'
            }
        },
        {
            color: '#00FF00',
            width: 2,
            value: minmax[1],
            label: {
                text: 'Max',
                align: 'right'
            }
        }]
    },
    tooltip: {
        valueSuffix: ' MOS'
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true
            }
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        shadow: true
    },
    credits: {
        enabled: false
    },
    series: [{
        name: 'Months Of Stock',
        data: data,
        
    }]
  }

  const classes = useStyles();

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
        title={(prog.name||"")+" MOS by commodity"} />
      <Divider />
      <CardContent>
        <div className={classes.chartContainer}>
          { data.length < 1 ? (
            <div style={{padding: '3rem 1rem'}}>
              <CircularProgress color="secondary" />
            </div>
          ) : ( 
            <HighchartsReact highcharts={Highcharts} options={options} />
          ) }
        </div>
      </CardContent>
      {/* <Divider /> */}
    </Card>
  );
};

export default MOSbyCommodity;
