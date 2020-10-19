///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

import * as d3 from "d3";
// import { csv } from "d3-fetch";

import _ from "lodash";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// opacity on hover
// dynamic dropdown selection
// load data at end as global var after plot function

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

console.clear();

// import mustache
// https://github.com/janl/mustache.js
const Mustache = require("mustache");

///////////////////////////////////////////////////////////////////////////
//////////////////////////// drawing function /////////////////////////////
///////////////////////////////////////////////////////////////////////////

const createChart = async () => {
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const url = "./data/EUISS Database.csv";

	let data = await d3.csv(url, (d) => {
		// console.log(d);
		return {
			// order
			id: d.CPI_CODE,
			name: d.Name,
			// plotting
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
			endLabel: d.End_day + "-" + d.End_month + "-" + d.End_year,
			report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
			reportDay: d.Report_day,
			reportMonth: d.Report_month,
			reportYear: d.Report_year,
			reportFix: new Date(
				+d.Report_year,
				+d.Report_month - 1,
				_.replace(d.Report_day, "unknown", 1)
			),
			// labels
			dyad: d.Dyad,
			disputeType: d.Type_of_dispute,
			geopoliticalSetting: d.Geopolitical_setting,
			initialaccesEnterprise: d.Initial_access_MITRE_ATT_Enterprise,
			initialaccesICS: d.Initial_access_MITRE_ATT_ICS,
			impactEnterprise: d.Impact_MITRE_ATT_Enterprise,
			addImpactEnterprise: d.Additional_Impact_MITRE_ATT_Enterprise,
			impactICS: d.Impact_MITRE_ATT_ICS,
			infosecEffect: d.Infosec_effect,
			physicalEffect: d.Physical_effect,
			corporateDowntime: d.Corporate_downtime,
			estimatedLoss: d.Estimated_loss,
			targetEntity: d.Target_entity,
			attackNuclearCapability: d.Attack_nuclear_capability,
			targetNuclearCapability: d.Target_nuclear_capability,
			attackAccountabilityIndex: d.Attack_accountability_index,
			targetAccountabilityIndex: d.Target_accountability_index,
			attackfdi: d.Attack_Foreign_Direct_Investment_ranking,
			targetfdi: d.Target_Foreign_Direct_Investment_ranking,
			fdi: d.Foreign_Direct_Investment,
			attack_gdpRank: d.Attack_GDP_rank,
			target_gdpRank: d.Target_GDP_rank,
			// reportLabel: d.Report_day + "-" + d.Report_month + "-" + d.Report_year,
			attacker_jurisdiction: d.Attack_jurisdiction,
			target_jurisdiction: d.Target_jurisdiction,
			victim_jurisdiction: d.Victim_jurisdiction,
			military: d.Ongoing_military_confrontation,
			command: d.Attack_cyber_command.trim(),
			us_me: d.US_military_effects
		};
	});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// accessor functions ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const xAcc = (d) => d.startYear;

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up svg ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);
	const height = d3.min([window.innerWidth * 0.33, window.innerHeight * 0.33]);
	const radius = 15;
	const margin = { top: 20, right: 20, bottom: 20, left: 120 };
	// const svg = d3.create("svg")
	// .attr("viewBox", [0, 0, width, height]);
	const svg = d3
		.select("#timeline_general") // id app
		.append("svg")
		// .attr("width", width)
		// .attr("height", height)
		.attr("viewBox", [-margin.left, 0, width + width - 800, height])
		// .attr("viewBox", [0, 0, width, height])
		.style("overflow", "visible");

	// group for voronoi cells
	// var g = svg
	// 	.append("g")
	// 	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// const t = d3.transition().duration(1500);

	// template
	var template = d3.select("#template").html();
	Mustache.parse(template);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	data[3].startYear = 2010;

	// pretty dates
	var formatTime = d3.timeFormat("%d %b %Y");
	data.forEach((d) => {
		d.reportLabel = formatTime(d.report);
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

	// data.reportLabel = formatTime(data.report)
	// console.log(reportArray);

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

	// console.log(xScale.domain(), xScale.range());

	var simulation = d3
		.forceSimulation(data)
		.force(
			"x",
			d3
				.forceX(function (d) {
					return xScale(d.startYear);
				})
				.strength(0.99)
		)
		.force("y", d3.forceY(height).strength(0.05))
		.force("collide", d3.forceCollide(radius))
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
		.attr("fill", "#3f8ca5")
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
			// d3.select(".tooltip .date").text(
			// 	"from " + d.startLabel + " to " + d.endLabel
			// );
			// name
			// d3.select(".tooltip .type").text("type: " + d.us_me);
			// attacker
			// d3.select(".tooltip .attacker").text(
			// 	"attacker: " + d.attacker_jurisdiction
			// );
			// victim
			// d3.select(".tooltip .target").text("target: " + d.name);
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
		})
		.on("click", showDetails);

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
	// });

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// details //////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	function showDetails(f) {
		var detailsHtml = Mustache.render(template, f);
		// Hide the initial container.
		d3.select("#initial").classed("hidden", true);
		// Put the HTML output in the details container and show (unhide) it.
		d3.select("#details").html(detailsHtml);
		d3.select("#details").classed("hidden", false);
		d3.select("#details").on("click", hideDetails);
	}

	function hideDetails() {
		// Hide the details
		// select("#details").attr("display", "none");
		d3.select("#details").classed("hidden", true);
		// Show the initial content
		// select("#initial").attr("display", "none");
		d3.select("#initial").classed("hidden", false);
	}

	// select(HTMLAnchorElement).on("click", hideDetails);
};

createChart();
