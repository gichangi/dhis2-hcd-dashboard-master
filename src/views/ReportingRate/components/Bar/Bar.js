import React, { useState } from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/export-data')(Highcharts);

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

const Bar = props => {
  let { className, scrr_subcounties, scrr_rate, loading, scrr_pe, ...rest } = props;

  const classes = useStyles();

  const chartOptions = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Latest Reporting Rate by Sub-County'
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS',
          ],
        },
      },
    },

    subtitle: {
      text: scrr_pe
    },

    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Reporting Rate (%)',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      borderWidth: 0
    },
    xAxis: {
      title: {
        text: 'Sub County'
      },
      categories: scrr_subcounties
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    series: [
      {
        name: 'Latest Sub-County Reporting Rate',
        data: scrr_rate
      }
    ]
  };

  return (
    <Grid lg={4} md={4} item>
      <Card {...rest} className={clsx(classes.root, className)}>
        <CardContent className={classes.content}>
          <div className={classes.inner}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Bar;
