// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
//import * as bootstrap from "bootstrap"

require("jquery")

import JQuery from 'jquery';
window.$ = window.JQuery = JQuery;

import 'bootstrap-treeview'

import "datatables.net";



//import "datatables.net-bs5";

import DataTable from 'datatables.net-bs5';
window.DataTable = DataTable();


import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "datatables.net-buttons-bs5";
import "datatables.net-responsive";
import "datatables.net-select";
import "datatables.net-fixedheader";