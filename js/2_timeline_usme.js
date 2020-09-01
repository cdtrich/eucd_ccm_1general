///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// binned beeswarm https://bl.ocks.org/Kcnarf/277bf4ac0c5a91a0be08be5dc23115c7
// legend
// linerange (d3.line x.begin x.end?!)...
// dropdown selection
// load data at end as global var after plot function

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
// import {
// 	select,
// 	extent,
// 	scaleLinear,
// 	timeFormat,
// 	timeYear,
// 	scaleBand,
// 	scaleOrdinal,
// 	line as _line,
// 	mouse,
// 	axisBottom,
// 	axisLeft,
// 	format,
// 	forceSimulation,
// 	forceX,
// 	forceY,
// 	forceCollide
// } from "d3";

// import _ from "lodash";
// Load the core build.
// import { forEach, chain } from "lodash";

// import fetch as d3-fetch from "d3-fetch";
// import { csv } from "d3-fetch";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = 1200;
const height = 300;
const radius = 15;
const margin = { top: 20, right: 20, bottom: 20, left: 120 };
const svg = d3
	.select("#timeline_usme") // id app
	.append("svg")
	// .attr("width", width)
	// .attr("height", height)
	// .attr("viewBox", [margin.left, 0, width * 1.5 , height])
	.attr("viewBox", [-margin.left, 0, width + width - 800, height])
	// .attr("viewBox", [-width / 2, -height / 2, width, height])
	.style("overflow", "visible");

var tooltip = d3.select("#chart").append("div").attr("class", "tooltip hidden");

const colorsType = [
	"#113655",
	"#f28c00",
	"#3f8ca5",
	"#fab85f",
	"#99d4e3",
	"#fed061"
];

// const t = d3.transition().duration(1500);

const url =
	// "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_852u619EmtHZE3p4sq7ZXwfrtxhOc1IlldXIu7z43OFVTtVZ1A577RbfgZEnzVhM_X0rnkGzxytz/pub?gid=0&single=true&output=csv";
	"data/EUISS Database.csv";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

d3.csv(url, (d) => {
	// console.log(d);
	return {
		id: d.CPI_CODE,
		name: d.Name,
		start: new Date(+d.Start_year, +d.Start_month - 1, +d.Start_day),
		startYear: +d.Start_year,
		// startFix: new Date(
		// 	+d.Start_year,
		// 	+d.Start_month - 1,
		// 	replace(d.Start_day, "unknown", 1)
		// ),
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		end: new Date(+d.End_year, +d.End_month, +d.end_day),
		endYear: +d.End_year,
		// endFix: new Date(
		// 	+d.End_year,
		// 	+d.End_month - 1,
		// 	replace(d.End_day, "unknown", 1)
		// ),
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
		attacker_jurisdiction: d.Attack_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		victim_jurisdiction: d.Victim_jurisdiction,
		us_me: d.US_military_effects
	};
}).then(function (data) {
	console.log(data);
	// data = _.head(data);

	// crappy stuxnet fix
	data = _.forEach(data, function (value) {
		value.startYear = value.name === "Stuxnet" ? 2010 : value.startYear;
	});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data table ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// new time formats for tooltip
	var formatDate = d3.timeFormat("%d %b %Y");
	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const xScale = d3
		.scaleLinear()
		.domain(
			d3.extent(data, (d) => {
				return d.startYear;
			})
		)
		.range([margin.left, width - margin.right]);

	// y - attackers (by jurisdiction)
	//// unique attackers
	const dataAttacker = _.chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();
	// console.log(dataAttacker);

	const yScale = d3
		.scaleBand()
		.domain(dataAttacker)
		.range([height - margin.bottom, margin.top]);

	var simulation = d3
		.forceSimulation(data)
		.force(
			"x",
			d3
				.forceX(function (d) {
					return xScale(d.startYear);
				})
				.strength(0.935)
		)
		.force(
			"y",
			d3
				.forceY(function (d) {
					return yScale(d.attacker_jurisdiction);
				})
				.strength(0.99)
		)
		.force("collide", d3.forceCollide(radius))
		.stop();

	for (var i = 0; i < 10; ++i) simulation.tick();

	// fix y-coordinate for exact data-based encoding/positioning
	data.forEach(function (d) {
		d.fy = yScale(d.attacker_jurisdiction);
	});

	// checking whether it computed correctly
	// console.log(yScale.domain(), yScale.range());

	// color - types of attacks (US M+D)
	//// unique types
	const dataType = _.chain(data)
		.map((d) => d.us_me)
		.uniq()
		.value();
	// console.log(dataType);

	const colorScale = d3.scaleOrdinal().domain(dataType).range(colorsType);
	// checking whether it computed correctly
	// console.log(colorScale.domain(), colorScale.range());

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// axes /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var formatAxis = d3.format(".4r");

	// axes
	const xAxis = d3.axisBottom().scale(xScale).tickFormat(formatAxis);
	const yAxis = d3.axisLeft().scale(yScale).tickSize(-width, width);

	svg
		.append("g")
		.classed("x-axis", true)
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg
		.append("g")
		.classed("y-axis", true)
		.attr("transform", `translate(${margin.left}, 0)`) // no transformation in x, but in y
		// .attr("color", "#eee")
		.call(yAxis)
		.select(".domain") // axis line is classed as .domain by default (check html); created by .call() above, .remove() after will drop it
		.remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// dots
	const dots = svg
		.selectAll("dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "dots")
		.attr("r", radius)
		.attr("cx", (d) => d.x)
		// y position needs some adjusting. why???
		.attr("cy", (d) => d.y + 20)
		.attr("fill", (d) => colorScale(d.us_me))
		// tooltip
		// .on("mouseover", showTooltip)
		// .on("mousemove", moveTooltip)
		// .on("mouseout", hideTooltip);
		.on("mouseover", (d, i) => {
			var mouseX = event.pageX + 10;
			var mouseY = event.pageY + 10;
			d3.select(".tooltip")
				// .style("left", mouseX + "px")
				// .style("top", mouseY  + "px")
				// .style("opacity", 0)
				// .transition()
				// .duration(100)
				.style("visibility", "visible")
				.style("opacity", 1)
				.style("left", mouseX + "px")
				.style("top", mouseY + "px");
			// console.log(d);
			// name
			d3.select(".tooltip h2").text(d.name);
			// date
			d3.select(".tooltip .date").text(
				"from " + d.startLabel + " to " + d.endLabel
			);
			// name
			d3.select(".tooltip .type").text("type: " + d.us_me);
			// attacker
			d3.select(".tooltip .attacker").text(
				"attacker: " + d.attacker_jurisdiction
			);
			// victim
			d3.select(".tooltip .target").text("target: " + d.name);
		})
		.on("mousemove", (d, i) => {
			const mouseX = event.pageX + 10;
			const mouseY = event.pageY + 10;
			d3.select(".tooltip")
				.style("left", mouseX + "px")
				.style("top", mouseY + "px");
		})
		.on("mouseout", function (d) {
			d3.select(".tooltip").style("visibility", "hidden");
		});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// legend ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var legend = svg
		.selectAll(".legend")
		.data(colorScale.domain())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function (d, i) {
			return "translate(" + (i * width) / 4 + ",20)";
		});

	legend
		.append("circle")
		.attr("cx", 150)
		.attr("cy", 0)
		.attr("r", radius / 2)
		// .attr("width", 18)
		// .attr("height", 18)
		.style("fill", colorScale);

	legend
		.append("text")
		.attr("x", 160)
		.attr("y", 0)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.text(function (d) {
			return d;
		});
});
