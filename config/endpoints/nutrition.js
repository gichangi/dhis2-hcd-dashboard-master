let DHIS_BASE_API_URL = process.env.DHIS_BASE_API_URL;
let APP_BASE_URL =
  process.env.REACT_APP_APP_BASE_URL || 'http://41.89.94.99:3000';
let nutrition = [
	{
	  page: "Global",
	  level: "All",
	  name: "Counties list",
	  id: "all__counties_list",
	  url: `${DHIS_BASE_API_URL}/organisationUnits.json?filter=level:eq:2&fields=id,name,level&paging=false`,
	  local_url: `${APP_BASE_URL}/api/common/counties`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
		page: 'Global',
		level: 'All',
		name: 'Organisation unit details',
		id: 'all__org_unit_details',
		local_url: `${APP_BASE_URL}/api/common/organisationUnit`,
		url: `${DHIS_BASE_API_URL}/organisationUnits`,
		Filters: '',
		Notes: ''
	},
	{
	  page: "Global",
	  level: "All",
	  name: "Subcounties list",
	  id: "all__subcounties_list",
	  url: `${DHIS_BASE_API_URL}/organisationUnits.json?filter=level:eq:3&fields=id,name,level,parent&paging=false`,
	  local_url: `${APP_BASE_URL}/api/common/subcounties`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
	  page: "Global",
	  level: "All",
	  name: "Wards list",
	  id: "all__wards_list",
	  url: `${DHIS_BASE_API_URL}/organisationUnits.json?filter=level:eq:4&fields=id,name,level,parent&paging=false`,
	  local_url: `${APP_BASE_URL}/api/common/wards`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
	  page: "Global",
	  level: "All",
	  name: "Facilities list",
	  id: "all__facilities_list",
	  url: `${DHIS_BASE_API_URL}/organisationUnits.json?filter=level:eq:5&fields=id,name,level,parent&paging=false`,
	  local_url: `${APP_BASE_URL}/api/common/facilities`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
	  page: "Global",
	  level: "All",
	  name: "CUs list",
	  id: "all__cus_list",
	  url: `${DHIS_BASE_API_URL}/organisationUnits.json?filter=level:eq:6&fields=id,name,level,parent&paging=false`,
	  local_url: `${APP_BASE_URL}/api/common/community-units`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
	  page: "Global",
	  level: "All",
	  name: "MFL codes",
	  id: "all__mfl_codes",
	  url: `${DHIS_BASE_API_URL}/organisationUnits.json?fields=id,code&paging=false`,
	  local_url: `${APP_BASE_URL}/api/common/mfl-codes`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
	  page: "Global",
	  level: "All",
	  name: "User details",
	  id: "all__user_details",
	  url: `${DHIS_BASE_API_URL}/me.json`,
	  local_url: `${APP_BASE_URL}/api/common/defaults`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},
	{
	  page: "Global",
	  level: "All",
	  name: "HIV commodities",
	  id: "all__commodities",
	  url: `${DHIS_BASE_API_URL}/dataSets/OSulH5zPHPw.json?fields=dataSetElements[dataElement[id,name]]`,
	  local_url: `${APP_BASE_URL}/api/common/commodities`,
	  default_period: "",
	  default_org_unit: "",
	  default_level: "",
	  notes: ""
	},

  ]
  module.exports = nutrition
