## Health Commodities Dashboard

> A DHIS2 packaged app to visualize supply chain and utilisation of health commodities in Kenya.

## Quick start

- [Download from Github](https://github.com/benzerbett/gcd-dash/archive/master.zip) or clone the repo: `git clone https://github.com/benzerbett/gcd-dash.git`

- Make sure your NodeJS and npm versions are up to date for `React 16.8.6`

- Clone the server (separate repo): `cd server && git clone https://github.com/uonafya/gcd-middleware ./`

- Install server dependencies: `cd server && npm install` or `cd server && yarn`

- Install client dependencies: `npm install` or `yarn`

- Start the server (on a separate terminal window): `cd server && npm run dev`

- Server will start on: `localhost:3000`

- Start the client: `npm start` or `yarn start`

- Dashboard will load on on: `localhost:8888`


## File Structure

Within the download you'll find the following directories and files:

```
gcd-dash

├── .eslintrc
├── .gitignore
├── .prettierrc
├── CHANGELOG.md
├── jsconfig.json
├── LICENSE.md
├── package.json
├── README.md
├── public
├── server
└── src
	├── assets
	├── common
	├── components
	├── helpers
	├── icons
	├── layouts
	├── theme
	├── views
	│	├── Dashboard
	│	├── DataQuality
	│	├── National
	│	├── NotFound
	│	├── ReportingRate
	│	├── StockStatus
	│	├── SupplyChain
	├── App.jsx
	├── index.jsx
	└── Routes.jsx
```

## Resources

- API Server (Express): <https://github.com/uonafya/gcd-middleware>
- DHIS2: <https://hiskenya.org>
- Technical Documentation: <https://github.com/uonafya/hcd-dashboard/blob/master/public/docs/README.md>
