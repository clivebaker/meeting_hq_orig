




require("@hotwired/turbo-rails");
require("./controllers");
JQuery = require("jquery");

//import JQuery from 'jquery';
window.$ = window.JQuery = JQuery;

require("datatables.net");
require("datatables.net-buttons");
require("datatables.net-buttons/js/buttons.html5.js");
require("datatables.net-buttons/js/buttons.print.js");
require("datatables.net-buttons-bs5");
require("datatables.net-responsive");
require("datatables.net-select");
require("datatables.net-fixedheader");


//import DataTable from 'datatables.net-bs5';

DataTable = require('datatables.net-bs5');
window.DataTable = DataTable();

import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;


require("./modules/theme");
// require("./modules/dragula");
// require("./modules/feather");
require("./modules/moment");
require("./modules/sidebar");
require("./modules/notyf");



