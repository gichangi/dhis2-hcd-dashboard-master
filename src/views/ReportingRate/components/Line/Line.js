import React, { useState } from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Snackbar from '@material-ui/core/Snackbar'
import Grid from '@material-ui/core/Grid'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
require('highcharts/modules/exporting')(Highcharts);

// if (typeof Highcharts === 'object') {
//   HighchartsExporting(Highcharts);
// }

const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: 0
  },
  inner: {
    // minWidth: 1050
    padding: '12px',
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
    justifyContent: 'flex-end',
    padding: '0px'
  }
}));

const Line = props => {
  let {
    className,
    Periods,
    rrData,
    ontimeData,
    cuData,
    rrname,
    cuname,
    OTname,
    loading,
    ...rest
  } = props;

  const classes = useStyles();

  const chart_Options = {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Reporting Rate'
    },

    subtitle: {
      text: ''
    },

    yAxis: {
      title: {
        text: '% Reporting Rate'
      },
      min: 0,
	  max: 110,
      showFirstLabel: false
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      borderWidth: 0
    },
    xAxis: {
      title: {
        text: 'Period'
      },
      categories: Periods
    },
    credits: {
      enabled: false
	},
	plotOptions: {
		line: {
			dataLabels: {
				enabled: true
			},
			enableMouseTracking: true
		}
	},
    series: [
      {
        name: OTname,
        data: ontimeData,
        color: '#f93535',
        tooltip: {
          valueDecimals: 1
        }
      },
      {
        name: cuname,
        data: cuData,
        color: '#28d7b7',
        tooltip: {
          valueDecimals: 1
        }
      },
      {
        name: rrname,
        data: rrData,
        tooltip: {
          valueDecimals: 1
        }
      }
    ]
  };

  return (
      <Grid lg={8} md={8} item>
        <Card {...rest} className={clsx(classes.root, className)}>
          <CardContent className={classes.content}>
            <Snackbar
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              open={loading}
              autoHideDuration={90000}
              message="Loading..."
            />
            <div className={classes.inner}>
              <HighchartsReact highcharts={Highcharts} options={chart_Options} />
            </div>
          </CardContent>
        </Card>
      </Grid>
  );
};

export default Line;
