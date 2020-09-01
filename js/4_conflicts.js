///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// this layout would be lovely https://observablehq.com/@tomwhite/beeswarm-bubbles
// load data at end as global var after plot function

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3.v5.min.js";
// import {
// 	select,
// 	extent,
// 	scaleLinear,
// 	// timeFormat,
// 	scaleOrdinal,
// 	axisBottom,
// 	format,
// 	forceSimulation,
// 	forceManyBody,
// 	forceX,
// 	forceY,
// 	// forceRadial,
// 	forceCollide
// } from "d3";

// import _ from "lodash";
// Load the core build.
// import { replace, chain } from "lodash";

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
	.select("#conflicts") // id app
	.append("svg")
	// .attr("width", width)
	// .attr("height", height)
	.attr("viewBox", [-margin.left, 0, width + width - 800, height])
	// .attr("viewBox", [0, 0, width, height])
	.style("overflow", "visible");

const colorsType = [
	"#113655",
	"#f28c00",
	"#3f8ca5",
	"#fab85f",
	"#99d4e3",
	"#fed061"
];

// group for voronoi cells
// var g = svg
// 	.append("g")
// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
		startFix: new Date(
			+d.Start_year,
			+d.Start_month - 1,
			_.replace(d.Start_day, "unknown", 1)
		),
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		end: new Date(+d.End_year, +d.End_month, +d.end_day),
		endYear: +d.End_year,
		endFix: new Date(
			+d.End_year,
			+d.End_month - 1,
			_.replace(d.End_day, "unknown", 1)
		),
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
		attacker_jurisdiction: d.Attack_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		victim_jurisdiction: d.Victim_jurisdiction,
		us_me: d.US_military_effects,
		military: d.Ongoing_military_confrontation
	};
}).then(function (data) {
	// console.log(data);
	// data = _.head(data);

	// crappy stuxnet fix
	data[3].startYear = 2010;

	// sorting to plot the smaller dots last
	data = data.sort(function (a, b) {
		if (a.military < b.military) {
			return -1;
		}
		if (a.military > b.military) {
			return 1;
		}
		return 0;
	});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data table ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// dropping missing dates (defaults to 1899 otherwise)
	// data = filter(data, (d) => {
	// 	return d.end_year > 2000;
	// });

	// new time formats for tooltip
	// var formatDate = timeFormat("%d %b %Y");

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

	const dataMilitary = _.chain(data)
		.map((d) => d.military)
		.uniq()
		.value();
	// console.log(dataMilitary);

	const sizeScale = d3
		.scaleOrdinal()
		.domain(dataMilitary)
		.range([28, 21, 14, 7]);

	const colorScale = d3.scaleOrdinal().domain(dataMilitary).range(colorsType);

	// console.log(sizeScale.domain(), sizeScale.range());

	var simulation = d3
		.forceSimulation(data)
		// .force(
		// 	"r",
		// 	forceRadial(function (d) {
		// 		return sizeScale(d.military);
		// 	}).strength(0.001)
		// )
		// .force("charge", forceManyBody().strength(1))
		.force("x", d3.forceX((d) => xScale(d.startYear)).strength(0.935))
		.force("y", d3.forceY(height).strength(0.05))
		// .force(
		// 	"collide",
		// 	forceCollide(d => sizeScale(d.radius)).strength(.05)
		// )
		.force("collide", d3.forceCollide(radius * 1.75))
		// .force("collide", forceCollide(radius))
		// .alphaTarget(.05)
		.stop();

	for (var i = 0; i < 10; ++i) simulation.tick();

	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// voronoi cells for better hover
	// var cell = g
	// 	.append("g")
	// 	.attr("class", "cells")
	// 	.selectAll("g")
	// 	.data(
	// 		d3
	// 			.voronoi()
	// 			.extent([
	// 				[-margin.left, -margin.top],
	// 				[width + margin.right, height + margin.top]
	// 			])
	// 			.x(function (d) {
	// 				return d.x;
	// 			})
	// 			.y(function (d) {
	// 				return d.y;
	// 			})
	// 			.polygons(data)
	// 	)
	// 	.enter()
	// 	.append("g");

	// dots
	const dots = svg
		.selectAll(".dots")
		.data(data)
		.enter()
		// cell
		.append("circle")
		.attr("class", "dots")
		// .attr("r", (d) => d.military)
		.attr("r", (d) => sizeScale(d.military))
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.attr("fill", (d) => colorScale(d.military))
		// .attr("fill", (d) => colorScale(d.us_me))
		.attr("stroke", "white")
		// tooltip
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
			return "translate(" + (i * width) / 6 + ",20)";
		});

	legend
		.append("circle")
		.attr("cx", 200)
		.attr("cy", 0)
		.attr("r", radius / 2)
		// .attr("width", 18)
		// .attr("height", 18)
		.style("fill", colorScale);

	legend
		.append("text")
		.attr("x", 210)
		.attr("y", 0)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
		.text(function (d) {
			return d;
		});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// axes /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// axes
	var formatAxis = d3.format(".4r");

	const xAxis = d3.axisBottom().scale(xScale).tickFormat(formatAxis);

	svg
		.append("g")
		.classed("x-axis", true)
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
});
