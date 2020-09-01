///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// xScale().domain() not working
// arcs (https://bl.ocks.org/emeeks/8d75da95d1e78cd08899)
// arcs (http://bl.ocks.org/enjoylife/4e435d329c2c743da33e)
// arcs (http://bl.ocks.org/mayblue9/dcc49ef6e3888f37f755177c4a248f2c)
// arcs (https://bl.ocks.org/rpgove/53bb49d6ed762139f33bdaea1f3a9e1c)
// linerange (d3.line x.begin x.end?!)...
// legend

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
import {
	select,
	timeFormat,
	scaleOrdinal,
	line as _line,
	curveBasis,
	axisBottom
} from "d3";

// import _ from "lodash";
// Load the core build.
import { chain, replace, split } from "lodash";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = 1200;
const height = 300;
const margin = { top: 20, right: 20, bottom: 20, left: 120 };
const svg = select("#dyads_general") // id app
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
		dyad_from: split(d.Dyad, "-")[0],
		dyad_to: split(d.Dyad, "-")[1],
		command: d.Existence_of_Cyber_Command.trimEnd(),
		us_me: d.US_military_effets
	};
}).then(function (data) {
	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data table ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// new time formats for tooltip
	var formatDate = timeFormat("%d %b %Y");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// x - dyad countries
	//// unique countries
	const dataDyad = chain(data)
		.map((d) => [d.dyad_from, d.dyad_to])
		.flatten()
		.uniq()
		.value();
	console.log(dataDyad);

	const xScale = scaleOrdinal()
		.domain(dataDyad)
		.range([margin.left, width - margin.right]);
	// console.log(xScale.domain(), xScale.range());

	// color - Existence_of_Cyber_Command
	//// unique types
	const dataType = chain(data)
		.map((d) => d.command)
		.uniq()
		.value();
	// console.log(dataType);

	const colorScale = scaleOrdinal().domain(dataType).range(colorsType);
	// checking whether it computed correctly
	// console.log(colorScale.domain(), colorScale.range());

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// var link = svg
	// 	.append("g")
	// 	.attr("class", "links")
	// 	.selectAll("path")
	// 	.data(data)
	// 	.enter()
	// 	.append("path")
	// 	.attr("d", function (d) {
	// 		return [
	// 			"M",
	// 			d.dyad_from,
	// 			height,
	// 			"A",
	// 			(d.dyad_from - d.dyad_to) / 2,
	// 			",",
	// 			(d.dyad_from - d.dyad_to) / 2,
	// 			0,
	// 			0,
	// 			",",
	// 			d.dyad_from < d.dyad_to ? 1 : 0,
	// 			d.dyad_to,
	// 			",",
	// 			height
	// 		].join(" ");
	// 	});
	// .attr('stroke-width', function (d) { return linkWidth(d.chapters.length); })
	// .on('mouseover', function (d) {
	//   link.style('stroke', null);
	//   select(this).style('stroke', '#d62333');
	// })
	// .on('mouseout', function (d) {
	//   link.style('stroke', null);
	// var node = svg
	// 	.append("g")
	// 	.attr("class", "nodes")
	// 	.selectAll("circle")
	// 	.data(data)
	// 	.enter()
	// 	.append("circle")
	// 	.attr("cx", function (d) {
	// 		return d.dyad_from;
	// 	})
	// 	.attr("cy", 0);
	// .attr('r', function (d) { return nodeRadius(d.chapters.length); })
	// .on('mouseover', function (d) {
	//   node.style('fill', null);
	//   d3.select(this).style('fill', 'black');
	//   var nodesToHighlight = graph.links.map(function (e) { return e.source === d ? e.target : e.target === d ? e.source : 0})
	//     .filter(function (d) { return d; });
	//   node.filter(function (d) { return nodesToHighlight.indexOf(d) >= 0; })
	//     .style('fill', '#555');
	//   link.style('stroke', function (link_d) {
	//     return link_d.source === d | link_d.target === d ? '#d62333' : null;
	//   });
	// })
	// .on('mouseout', function (d) {
	//   node.style('fill', null);
	//   link.style('stroke', null);
	// });

	// lines
	// var line = _line()
	// 	.curve(curveBasis)
	// 	.x((d) => xScale(d.dyad_from))
	// 	.y(0);

	// var linerange = svg
	// 	.selectAll("path.linerange")
	// 	.data(data)
	// 	.enter()
	// 	.append("g")
	// 	.attr("class", "linerange");

	// linerange
	// 	.append("path")
	// 	.attr("d", function (d) {
	// 		return line(d.dyad_from);
	// 	})
	// 	.attr("id", (d) => d.attacker_jurisdiction);

	// labels
	// const labels = svg
	// 	.selectAll("label")
	// 	.data(data)
	// 	.enter()
	// 	.append("text")
	// 	.classed("label", true)
	// 	.text((d) => d.name)
	// 	.attr("x", (d) => xScale(d.dyad_from) + 6)
	// 	.attr("y", 0);

	var dots = svg
		.selectAll("dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("r", 6)
		.attr("cx", (d) => xScale(d.dyad_from));

	// dots
	// const dots = svg
	// 	.selectAll("dots")
	// 	.data(data)
	// 	.enter()
	// 	.append("circle")
	// 	.attr("r", 6)
	// 	.attr("cx", (d) => xScale(d.dyad_from))
	// 	.attr("cy", 0)
	// 	.attr("fill", (d) => colorScale(d.command));
	// // tooltip
	// .on("mouseover", (d, i) => {
	// 	const mouseX = event.pageX;
	// 	const mouseY = event.pageY;
	// 	// make dots outline?
	// 	// select("circle").attr("r", 12);
	// 	select(".tooltip")
	// 		// .transition()
	// 		// .duration(100)
	// 		.style("visibility", "visible")
	// 		.style("opacity", 1)
	// 		.style("left", mouseX + "px")
	// 		.style("top", mouseY - 28 + "px");
	// 	// console.log(d);
	// 	// name
	// 	select(".tooltip h2").text(d.name);
	// 	// date
	// 	select(".tooltip .date").text(
	// 		"from " + formatDate(d.start) + " to " + formatDate(d.end)
	// 	);
	// 	// name
	// 	select(".tooltip .type").text("type: " + d.us_me);
	// 	// attacker
	// 	select(".tooltip .attacker").text("attacker: " + d.attacker_jurisdiction);
	// 	// victim
	// 	select(".tooltip .target").text("target: " + d.name);
	// })
	// .on("mouseout", function (d) {
	// 	select(".tooltip")
	// 		// .transition()
	// 		// .duration(500)
	// 		.style("visibility", "hidden");
	// });

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// axes /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// axes
	const xAxis = axisBottom().scale(xScale);
	// .tickFormat(d => "$" + parseInt((d + meanBox) / 1000000) + "M"); // parseInt takes off decimals

	// svg
	// 	.append("g")
	// 	.classed("x-axis", true)
	// 	// .attr("transform", `translate(0, ${yScale()})`) // no transformation in x, but in y
	// 	.attr("transform", "translate(0," + height + ")")
	// 	// .style("outline-style", "dotted")
	// 	// .attr("")
	// 	.call(xAxis);
});
