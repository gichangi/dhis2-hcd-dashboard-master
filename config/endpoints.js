let DHIS_BASE_API_URL = process.env.DHIS_BASE_API_URL;
let APP_BASE_URL =
  process.env.REACT_APP_APP_BASE_URL || 'http://41.89.94.99:3000';

let endpoints = {}  
endpoints.f_p = require('./endpoints/fp');
endpoints.m_al = require('./endpoints/malaria');
endpoints.t_b = require('./endpoints/tb');
let hiveps = require('./endpoints/hiv');
endpoints.hiv_adult_preps = hiveps.hiv_adult_preps
endpoints.hiv_oi_preps = hiveps.hiv_oi_preps
endpoints.hiv_paed_preps = hiveps.hiv_paed_preps
endpoints.hiv_tb_preps = hiveps.hiv_tb_preps
endpoints.hiv_lab_preps = hiveps.hiv_lab_preps
endpoints.e_mms = require('./endpoints/emms');
endpoints.n_utr = require('./endpoints/nutrition');

module.exports = endpoints;
