import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';
import useTheme from '@material-ui/styles/useTheme';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
require('highcharts/modules/exporting')(Highcharts);

const useStyles = makeStyles(() => ({
  root: {},
  chartContainer: {
    height: 400,
    position: 'relative',
    textAlign: 'center'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const LineGraph = props => {
  const { className, data, period, ...rest } = props;
  const theme = useTheme();
  const options = {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Reporting health facilities that had weight band data in DHIS'
    },
    subtitle: {
      text: ''
    },
    credits: {
      enabled: false
    },
    yAxis: {
      title: {
        text: 'Facilities'
      }
    },
    xAxis: {
      title: {
        text: 'Period'
      },
      categories: period
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: ['downloadPNG', 'downloadSVG', 'separator', 'label']
        }
      }
    },
    legend: {
      layout: 'vertical',
      align: 'center',
      verticalAlign: 'bottom'
    },

    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      },
      series: {
        label: {
          connectorAllowed: false
        }
      }
    },
    series: data,
    colors: ['#92d050', '#c55a11', '#8497b0'],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }
      ]
    }
  };

  const classes = useStyles();

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      {/* <CardHeader title="National Summary" /> */}
      <Divider />
      <CardContent>
        <div className={classes.chartContainer}>
          {data.length < 1 ? (
            <div style={{ padding: '3rem 1rem' }}>
              <CircularProgress color="secondary" />
            </div>
          ) : (
            <HighchartsReact highcharts={Highcharts} options={options} />
          )}
        </div>
      </CardContent>
      {/* <Divider /> */}
    </Card>
  );
};

export default LineGraph;
