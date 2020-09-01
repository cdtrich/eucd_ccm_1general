// import * as d3 from "d3";
// import fetch as d3-fetch from "d3-fetch";
import XLSX from "sheetjs";

var url =
	// "https://www.dropbox.com/s/dfv0h4ek20qjgbx/EUISS%20Database%202020-08-04%20ET.xlsx?dl=1";
	"data/EUISS Database 2020-08-04 ET.xlsx";

/* set up async GET request */
var req = new XMLHttpRequest();
req.open("GET", url, true);
req.responseType = "arraybuffer";

req.onload = function (e) {
	var data = new Uint8Array(req.response);
	var workbook = XLSX.read(data, { type: "array" });

	/* DO SOMETHING WITH workbook HERE */
	console.log(workbook);
};

// console.log(workbook);

req.send();

// d3.csv(
// 	"https://docs.google.com/spreadsheets/d/e/2PACX-1vTdG_7VdMiD0Og99uv07D5zpFJdnJ-knWmzNdzLFww3ZHJBVd7joUKSQiPyGgX1WBJEjPkR_WK7WyyF/pub?output=csv",
// 	function(error, d) {
// 		return {
// 			id: d.CPI,
// 			name: d.Name,
// 			start: new Date(+d.start_year, +d.start_month, +d.start_day),
// 			end: new Date(+d.end_year, +d.end_month, +d.end_day),
// 			report: new Date(+d.report_year, +d.report_month, +d.report_day)
// 		};
// 	}
// ).then(function(data) {
// 	console.log(data);
// });

// console.log(data);
