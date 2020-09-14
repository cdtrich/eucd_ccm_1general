// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

// import _ from "lodash";
import _ from "lodash";

import * as XLSX from "xlsx";

const url =
	// "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_852u619EmtHZE3p4sq7ZXwfrtxhOc1IlldXIu7z43OFVTtVZ1A577RbfgZEnzVhM_X0rnkGzxytz/pub?gid=0&single=true&output=csv";
	// "data/EUISS Database.csv";
	"https://www.dropbox.com/s/47t2m2xidvum6hk/EUISS%20Database%20w%20notes%202020-08-18%20ET.xlsx?dl=0";

// let response = await fetch(url);

var sheet = XLSX.read();

// var first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
// var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });

/* convert from array of arrays to workbook */
// var worksheet = XLSX.utils.aoa_to_sheet(data);
// var new_workbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
// console.log(worksheet);

// json = [];

// if (response.ok) {
// 	// if HTTP-status is 200-299
// 	// get the response body (the method explained below)
// 	let json = await response.csv();
// 	console.log(json);
// } else {
// 	alert("HTTP-Error: " + response.status);
// }

// if (typeof require !== "undefined") XLSX = require("xlsx");
// var workbook = XLSX.readFile("test.xlsx");
// console.log(workbook);
/* DO SOMETHING WITH workbook HERE */

///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// use this file as data file
// read in xlsx: https://github.com/SheetJS/sheetjs
// and https://sheetjs.com/

// take response from promisea

///////////////////////////////////////////////////////////////////////////
//////////////////////////// colors ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const colorsType = [
	"#d82739",
	"#5ebfbc",
	"#f28c00",
	"#113655",
	"#3C1438",
	"#53A2BE"
];

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var data = csv(url, (d) => {
	return {
		id: d.CPI_CODE,
		name: d.Name,
		// start: new Date(+d.Start_year, +d.Start_month - 1, +d.Start_day),
		startYear: +d.Start_year,
		// startFix: new Date(
		// 	+d.Start_year,
		// 	+d.Start_month - 1,
		// 	replace(d.Start_day, "unknown", 1)
		// ),
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		// end: new Date(+d.End_year, +d.End_month, +d.end_day),
		endYear: +d.End_year,
		// endFix: new Date(
		// 	+d.End_year,
		// 	+d.End_month - 1,
		// 	replace(d.End_day, "unknown", 1)
		// ),
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		// report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
		attacker_jurisdiction: d.Attacker_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		victim_jurisdiction: d.Victim_jurisdiction,
		us_me: d.US_military_effects,
		military: d.Ongoing_military_confrontation,
		command: d.Attack_cyber_command.trim(),
		sector_i: d.Target_CI_sector.trim(),
		sector_ii: d.Target_CI_sector_II.trim(),
		sector_iii: d.Target_CI_sector_III.trim(),
		dyad_from: split(d.Dyad, "-")[0],
		dyad_to: split(d.Dyad, "-")[1]
	};
}).then(function (d) {
	// stuxnet fix
	var data = forEach(d, function (value) {
		value.startYear = value.name === "Stuxnet" ? 2010 : value.startYear;
	});

	// var data = d;
	// data = (name === "Stuxnet") ? startYear : "2010";

	// crappy stuxnet fix
	// data[3].startYear = 2010;

	// function stuxnet(val) {
	// 	if (val.name === "Stuxnet") {
	// 		d.startYear = 2010
	// 	}
	// }
	// stuxnet(data)

	// data = data;

	// return data;

	// console.log(data);
});

// var dataGlobal = data;

export { data };
