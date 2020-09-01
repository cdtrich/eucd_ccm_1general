///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// exception for dates with day == "unkown"
// linerange (d3.line x.begin x.end?!)...
// dropdown selection
// load data at end as global var after plot function
// legend

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
import {
	select,
	extent,
	scaleTime,
	timeFormat,
	timeYear,
	scaleBand,
	scaleOrdinal,
	line as _line,
	curveBasis,
	axisBottom,
	axisLeft
} from "d3";

// import _ from "lodash";
// Load the core build.
import { filter, chain, replace } from "lodash";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = 1200;
const height = 300;
const margin = { top: 20, right: 20, bottom: 20, left: 120 };
const svg = select("#timeline_usme") // id app
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("overflow", "visible");

const colorsType = [
	"#d82739",
	"#5ebfbc",
	"#f28c00",
	"#113655",
	"#3C1438",
	"#53A2BE"
];

// const t = d3.transition().duration(1500);

const url =
	// "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_852u619EmtHZE3p4sq7ZXwfrtxhOc1IlldXIu7z43OFVTtVZ1A577RbfgZEnzVhM_X0rnkGzxytz/pub?gid=0&single=true&output=csv";
	"data/EUISS Database 2020-08-04 ET.csv";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

csv(url, (d) => {
	// console.log(d);
	return {
		id: d.CPI_CODE,
		name: d.Name,
		start: new Date(+d.Start_year, +d.Start_month - 1, +d.Start_day),
		startYear: +d.Start_year,
		startFix: new Date(
			+d.Start_year,
			+d.Start_month - 1,
			replace(d.Start_day, "unknown", 1)
		),
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		end: new Date(+d.End_year, +d.End_month, +d.end_day),
		endYear: +d.End_year,
		endFix: new Date(
			+d.End_year,
			+d.End_month - 1,
			replace(d.End_day, "unknown", 1)
		),
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
		attacker_jurisdiction: d.Attacker_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		victim_jurisdiction: d.Victim_jurisdiction,
		us_me: d.US_military_effets
	};
}).then(function (data) {
	// console.log(data);
	// data = _.head(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data table ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// d3.select("#output").text(
	// 	data[0].id + " " + data[0].name + " " + data[0].start
	// );

	// dropping missing dates (defaults to 1899 otherwise)
	// data = filter(data, (d) => {
	// 	return d.end > new Date("2000-01-01");
	// });

	// fixing missing days
	// dataFix = mapValues(data, function(d, i) {
	// d.start
	// });
	// dataFix = chain(data)
	// .replace((d) => d.start, "unknown", "01");
	// var replaceUnknown = function (arr, key, newval) {
	// 	var match = find(arr, key);
	// 	if (match) {
	// 		var index = indexOf(arr, find(arr, key));
	// 		arr.splice(index, 1, newval);
	// 	} else {
	// 		arr.push(newval);
	// 	}
	// };

	// data.startFix = replaceUnknown(data.Start_day, "unknown", "01");
	// console.log(data);

	// 	var data = chain(data)
	// 	.map(data, function(element) {
	// 		return _.extend({}, element, {start_fix: 0});
	// })
	// 	.map(function(a) {
	// 		return a.Start_day === "unknown" ? 1;
	// 	});

	// new time formats for tooltip
	var formatDate = timeFormat("%d %b %Y");
	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// x - dates of attacks
	const dataDates = chain(data)
		// pick all date properties
		.map((d) => [d.start, d.end, d.report])
		// .pick(d => [d.start, d.end, d.report])
		// .filter(d => d >= [new Date("2000-01-01")])
		// .without(d => d < new Date("2000-01-01"))
		.flatten()
		.value();
	// attr("fill", d => (d.type === "summer" ? summer.url() : winter.url()));

	// console.log(dataDates);

	const [dateMin, dateMax] = extent(dataDates);

	const xScale = scaleTime()
		.domain([timeYear.floor(dateMin), timeYear.ceil(dateMax)])
		.range([margin.left, width - margin.right]);
	// console.log(xScale.domain(), xScale.range());

	// y - attackers (by jurisdiction)
	//// unique attackers
	const dataAttacker = chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();
	// console.log(dataAttacker);
	const yScale = scaleBand()
		// .scaleOrdinal()
		.domain(dataAttacker)
		.range([height - margin.bottom, margin.top]);
	// checking whether it computed correctly
	// console.log(yScale.domain(), yScale.range());

	// color - types of attacks (US M+D)
	//// unique types
	const dataType = chain(data)
		.map((d) => d.us_me)
		.uniq()
		.value();
	// console.log(dataType);
	const colorScale = scaleOrdinal().domain(dataType).range(colorsType);
	// checking whether it computed correctly
	// console.log(colorScale.domain(), colorScale.range());

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// lines
	var line = _line()
		.curve(curveBasis)
		.x((d) => xScale(d.start))
		.y((d) => yScale(d.attacker_jurisdiction));

	var linerange = svg
		.selectAll("path.linerange")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "linerange");

	linerange
		.append("path")
		.attr("d", function (d) {
			return line(d.attacker_jurisdiction);
		})
		.attr("id", (d) => d.attacker_jurisdiction);
	// .style("stroke", function(d, i) { return z(i); });

	// labels
	const labels = svg
		.selectAll("label")
		.data(data)
		.enter()
		.append("text")
		.classed("label", true)
		.text((d) => d.name)
		.attr("x", (d) => xScale(d.start) + 6)
		.attr("y", (d) => yScale(d.attacker_jurisdiction) + 15);

	// dots
	const dots = svg
		.selectAll("dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("r", 6)
		.attr("cx", (d) => xScale(d.start))
		.attr("cy", (d) => yScale(d.attacker_jurisdiction) + 12)
		.attr("fill", (d) => colorScale(d.us_me))
		// tooltip
		.on("mouseover", (d, i) => {
			const mouseX = event.pageX;
			const mouseY = event.pageY;
			// make dots outline?
			// select("circle").attr("r", 12);
			select(".tooltip")
				// .transition()
				// .duration(100)
				.style("visibility", "visible")
				.style("opacity", 1)
				.style("left", mouseX + "px")
				.style("top", mouseY - 28 + "px");
			// console.log(d);
			// name
			select(".tooltip h2").text(d.name);
			// date
			select(".tooltip .date").text(
				"from " + formatDate(d.start) + " to " + formatDate(d.end)
			);
			// name
			select(".tooltip .type").text("type: " + d.us_me);
			// attacker
			select(".tooltip .attacker").text("attacker: " + d.attacker_jurisdiction);
			// victim
			select(".tooltip .target").text("target: " + d.name);
		})
		.on("mouseout", function (d) {
			select(".tooltip")
				// .transition()
				// .duration(500)
				.style("visibility", "hidden");
		});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// axes /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// axes
	const xAxis = axisBottom().scale(xScale);
	const yAxis = axisLeft().scale(yScale);
	// .tickFormat(d => "$" + parseInt((d + meanBox) / 1000000) + "M"); // parseInt takes off decimals

	svg
		.append("g")
		.classed("x-axis", true)
		// .attr("transform", `translate(0, ${yScale()})`) // no transformation in x, but in y
		.attr("transform", "translate(0," + height + ")")
		// .style("outline-style", "dotted")
		// .attr("")
		.call(xAxis);
	svg
		.append("g")
		.classed("y-axis", true)
		.attr("transform", `translate(${margin.left}, 0)`) // no transformation in x, but in y
		.call(yAxis)
		.select(".domain") // axis line is classed as .domain by default (check html); created by .call() above, .remove() after will drop it
		.remove();
});
