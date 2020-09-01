///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// resolve promise to data.js
// hover
// dropdown selection

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
import {
	select,
	extent,
	scaleLinear,
	// timeFormat,
	axisBottom,
	format,
	forceSimulation,
	forceX,
	forceY,
	forceCollide
} from "d3";

// import _ from "lodash";
// Load the core build.
import { replace } from "lodash";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

import { data } from "./data.js";

// data = resolve(data);
// var d = Promise.resolve(data);
// console.log(d);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = 1200;
const height = 300;
const radius = 15;
const margin = { top: 20, right: 20, bottom: 20, left: 120 };
// const svg = d3.create("svg")
// .attr("viewBox", [0, 0, width, height]);
const svg = select("#timeline_general") // id app
	.append("svg")
	// .attr("width", width)
	// .attr("height", height)
	.attr("viewBox", [0, 0, width, height])
	.style("overflow", "visible");

// alert (colorsType.back);

// group for voronoi cells
// var g = svg
// 	.append("g")
// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// const t = d3.transition().duration(1500);

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
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

Promise.resolve("Success").then(
	function (value) {
		console.log(value);
		var d = data;
		console.log(d);
	},
	function (d) {
		console.log(d);

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// scales ///////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		const xScale = scaleLinear()
			.domain(
				extent(data, (d) => {
					return d.startYear;
				})
			)
			.range([margin.left, width - margin.right]);

		// console.log(xScale.domain(), xScale.range());

		var simulation = forceSimulation(data)
			.force(
				"x",
				forceX(function (d) {
					return xScale(d.startYear);
				}).strength(0.99)
			)
			.force("y", forceY(height).strength(0.05))
			.force("collide", forceCollide(radius))
			.stop();
		// this crashes
		// .alphaDecay(0)
		// .alpha(0.12)
		// .on('tick', tick);

		for (var i = 0; i < 10; ++i) simulation.tick();

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

		// bouncy dots from here https://bl.ocks.org/maegul/7d8e7342c649fdc077a6984e52da4b62
		// function tick() {
		// 	selectAll(".dots")
		// 		.attr("cx", (d) => d.x)
		// 		.attr("cy", (d) => d.y);
		// };

		// dots

		const dots = svg
			.selectAll(".dots")
			.data(data)
			.enter()
			// cell
			.append("circle")
			.attr("class", "dots")
			.attr("r", radius)
			.attr("cx", (d) => d.x)
			.attr("cy", (d) => d.y)
			// tooltip
			.on("mouseover", (d, i) => {
				const mouseX = event.pageX;
				const mouseY = event.pageY;
				select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY - 28 + "px")
					.style("opacity", 0)
					.transition()
					.duration(100)
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY - 28 + "px");
				// console.log(d);
				// name
				select(".tooltip h2").text(d.name);
				// date
				select(".tooltip .date").text(
					"from " + d.startLabel + " to " + d.endLabel
				);
				// name
				select(".tooltip .type").text("type: " + d.us_me);
				// attacker
				select(".tooltip .attacker").text(
					"attacker: " + d.attacker_jurisdiction
				);
				// victim
				select(".tooltip .target").text("target: " + d.name);
			})
			.on("mouseout", function (d) {
				select(".tooltip").style("visibility", "hidden");
			});

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// axes /////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		// axes
		var formatAxis = format(".4r");

		const xAxis = axisBottom().scale(xScale).tickFormat(formatAxis);

		svg
			.append("g")
			.classed("x-axis", true)
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
	}
);
