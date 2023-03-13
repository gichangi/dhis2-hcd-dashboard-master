import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import Technical from 'views/Documentation/Technical';

import { RouteWithLayout } from './components';
import { Main as MainLayout, Minimal as MinimalLayout } from './layouts';

import {
  Dashboard as DashboardView,
  Landing as LandingView,
  NotFound as NotFoundView,
  ErrorPage as ErrorPageView,
  StockStatusOne,
  StockStatusAll,
  StockStatusMap,
  RRSummary,
  RRFacility,
  RRSubcounty,
  Accountability,
  Expiries,
  IssuesReceipts,
  DQConsistency,
  DQConcordance,
  DQCompleteness,
  DQComparison,
  SCSummary,
  SCTrends,
  NatSummary,
  NatPendingShip,
  NatCommodities,
  Understocked,
  Overstocked, 
  RiskParameters
} from './views';

const Routes = () => {
  return (
    <Switch>
      {/* <Redirect exact from="/" to="/dashboard" /> */}
      <RouteWithLayout
        component={LandingView}
        exact
        layout={MinimalLayout}
        path="/"
      />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/dashboard"
      />
      {/*  Stock status  */}
      <RouteWithLayout
        component={StockStatusOne}
        exact
        layout={MainLayout}
        path="/ss"
      />
      <RouteWithLayout
        component={StockStatusOne}
        exact
        layout={MainLayout}
        path="/stockstatus"
      />
      <RouteWithLayout
        component={StockStatusOne}
        exact
        layout={MainLayout}
        path="/ss/commodity"
      />
      <RouteWithLayout
        component={StockStatusAll}
        exact
        layout={MainLayout}
        path="/ss/all"
      />
      <RouteWithLayout
        component={StockStatusMap}
        exact
        layout={MainLayout}
        path="/ss/map"
      />
      {/*  Stock status  */}
      {/*  Data quality  */}
      <RouteWithLayout
        component={DQCompleteness}
        exact
        layout={MainLayout}
        path="/dq"
      />
      <RouteWithLayout
        component={DQCompleteness}
        exact
        layout={MainLayout}
        path="/dq/completeness"
      />
      <RouteWithLayout
        component={DQConcordance}
        exact
        layout={MainLayout}
        path="/dq/concordance"
      />
      <RouteWithLayout
        component={DQConsistency}
        exact
        layout={MainLayout}
        path="/dq/consistency"
      />
      <RouteWithLayout
        component={DQComparison}
        exact
        layout={MainLayout}
        path="/dq/comparison"
      />
      {/*  Data quality  */}
      {/*  Reporting rate  */}
      <RouteWithLayout
        component={RRSummary}
        exact
        layout={MainLayout}
        path="/rr"
      />
      <RouteWithLayout
        component={RRSummary}
        exact
        layout={MainLayout}
        path="/rr/summary"
      />
      <RouteWithLayout
        component={RRFacility}
        exact
        layout={MainLayout}
        path="/rr/facility"
      />
      <RouteWithLayout
        component={RRSubcounty}
        exact
        layout={MainLayout}
        path="/rr/subcounty"
      />
      {/*  Reporting rate  */}
      {/*  Supply chain perf  */}
      <RouteWithLayout
        component={SCSummary}
        exact
        layout={MainLayout}
        path="/scp"
      />
      <RouteWithLayout
        component={SCSummary}
        exact
        layout={MainLayout}
        path="/scp/summary"
      />
      <RouteWithLayout
        component={SCTrends}
        exact
        layout={MainLayout}
        path="/scp/trends"
      />
      <RouteWithLayout
        component={Accountability}
        exact
        layout={MainLayout}
        path="/accountability"
      />
      <RouteWithLayout
        component={Expiries}
        exact
        layout={MainLayout}
        path="/expiries"
      />
      <RouteWithLayout
        component={IssuesReceipts}
        exact
        layout={MainLayout}
        path="/issues-receipts"
      />
      <RouteWithLayout
        component={Understocked}
        exact
        layout={MainLayout}
        path="/hff/understocked"
      />
      <RouteWithLayout
        component={Overstocked}
        exact
        layout={MainLayout}
        path="/hff/overstocked"
      />
      {/*  Supply chain perf  */}
      {/*  National  */}
      <RouteWithLayout
        component={NatSummary}
        exact
        layout={MainLayout}
        path="/national"
      />
      <RouteWithLayout
        component={NatSummary}
        exact
        layout={MainLayout}
        path="/national/summary"
      />
      <RouteWithLayout
        component={NatCommodities}
        exact
        layout={MainLayout}
        path="/national/commodities"
      />
      <RouteWithLayout
        component={NatPendingShip}
        exact
        layout={MainLayout}
        path="/national/pending-shipments"
      />
      {/* <RouteWithLayout
        component={NatIssuesR}
        exact
        layout={MainLayout}
        path="/issues-receipts"
        // path="/national/issues-receipts"
      /> */}
      {/*  National  */}
      {/*  404  */}
      <RouteWithLayout
        component={NotFoundView}
        exact
        layout={MinimalLayout}
        path="/not-found"
      />
      <RouteWithLayout
        component={ErrorPageView}
        exact
        layout={MinimalLayout}
        path="/error"
      />
      <RouteWithLayout
        component={Technical}
        layout={MinimalLayout}
        path="/docs"
      />
      <RouteWithLayout
        component={Technical}
        exact
        layout={MinimalLayout}
        path="/docs/technical"
      />
      <RouteWithLayout
      component={RiskParameters}
      exact
      layout={MainLayout}
      path="/riskparameters"
      />
      {/*  404  */}
      {/* <Redirect from="/404" to="/not-found" /> */}
    </Switch>
  );
};

export default Routes;
