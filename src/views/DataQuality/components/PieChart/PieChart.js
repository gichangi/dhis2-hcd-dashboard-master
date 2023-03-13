import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/styles/makeStyles';
import useTheme from '@material-ui/styles/useTheme';

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'

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

const PieChart = props => {
  const { className, data, title, period, ...rest } = props;
  const theme = useTheme();
  const options = {
    chart: {
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false,
		type: 'pie'
	},
    title: {
      text: title
    },
    subtitle: {
      text: data.subtitle || ''
    },
    credits: {
      enabled: false
    },
    exporting: {
		enabled: true,
    //   buttons: {
    //     contextButton: {
    //       menuItems: ['downloadPNG', 'downloadSVG', 'separator', 'label']
    //     }
    //   }
	},
	tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
	  },
	  pie: {
                            
		allowPointSelect: true,
		colors: ['#7bd48d','#ffc7ce'],
		cursor: 'pointer',
		dataLabels: {
			enabled: true
		},
		showInLegend: true
	  }
    },
    series: [{
		name: 'Percentage',
		colorByPoint: true,
		valueDecimals: 2,
		data: [{
			name: data.eq_title,
			y: data.eq
		}, {
			name: data.n_eq_title,
			y: data.n_eq
		}]
	}],
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
      <CardHeader title="Data Quality" />
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

export default PieChart;
