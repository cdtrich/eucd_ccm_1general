///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

import * as d3 from "d3";
import { easeBounceIn, easeCubic, easeExp, easePoly } from "d3";
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

// if element already exists, return selection
// if it doesn't exist, create it and give it class
const selectOrCreate = (elementType, className, parent) => {
	const selection = parent.select("." + className);
	if (!selection.empty()) return selection;
	return parent.append(elementType).attr("class", className);
};

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
			// id: d.CPI_CODE,
			name: d.Name,
			// plotting
			// start: new Date(+d.Start_year, +d.Start_month - 1, +d.Start_day),
			startYear: +d.Start_year,
			// startFix: new Date(
			// 	+d.Start_year,
			// 	+d.Start_month - 1,
			// 	_.replace(d.Start_day, "unknown", 1)
			// ),
			// startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
			// end: new Date(+d.End_year, +d.End_month, +d.end_day),
			// endYear: +d.End_year,
			// endFix: new Date(
			// 	+d.End_year,
			// 	+d.End_month - 1,
			// 	_.replace(d.End_day, "unknown", 1)
			// ),
			// endLabel: d.End_day + "-" + d.End_month + "-" + d.End_year,
			reportDay: d.Report_day,
			reportMonth: d.Report_month,
			reportYear: d.Report_year,
			report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
			// reportFix: new Date(
			// 	+d.Report_year,
			// 	+d.Report_month - 1,
			// 	_.replace(d.Report_day, "unknown", 1)
			// ),
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
			// other for coloring
			military: d.Ongoing_military_confrontation,
			command: d.Attack_cyber_command.trim(),
			us_me: d.US_military_effects,
			url: d.url
		};
	});
	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// accessor functions ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const xAcc = (d) => d.startYear;

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up svg ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]),
		height = d3.min([window.innerWidth * 0.33, window.innerHeight * 0.33]),
		radius = width / 60,
		margin = { top: 20, right: 50, bottom: 20, left: 50 };
	// const svg = d3.create("svg")
	// .attr("viewBox", [0, 0, width, height]);

	const svg = d3
		.select("#app") // id app
		.append("svg")
		// .attr("width", width)
		// .attr("height", height)
		// .attr("viewBox", [-margin.left, 0, width , height])
		.attr("viewBox", [margin.left / 2, margin.right, width, height])
		.style("overflow", "visible");

	// template
	var template = d3.select("#template").html();
	Mustache.parse(template);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// pretty dates
	var formatTime = d3.timeFormat("%d %b %Y");
	data.forEach((d) => {
		d.reportLabel = formatTime(d.report);
	});

	// fixing incomplete data
	data.forEach((d) => {
		switch (d.name) {
			case "Stuxnet":
				d.startYear = 2010;
				break;
			case "DDoS on US Banks":
				d.reportLabel = "2012";
				break;
			default:
		}
	});

	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const colorsType = [
		"#113655",
		"#f28c00",
		"#3f8ca5",
		"#fab85f",
		"#99d4e3",
		"#fed061"
	];

	const wrap = (s, w) =>
		s
			.toString()
			.replace(
				new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"),
				"$1\n"
			);

	var dataType = _.chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();

	// weirdly doesn't show in legend
	var dataTypeLabel = dataType.map((d) => wrap(d, 20));
	// var dataTypeLabel = dataType.map((d) => d + "wrap");
	// console.log(dataType);
	// console.log(dataTypeLabel);

	const xScale = d3
		.scaleLinear()
		.domain(
			d3.extent(data, (d) => {
				return d.startYear;
			})
		)
		.range([margin.left, width - margin.right]);

	const cScale = d3.scaleOrdinal().domain(dataTypeLabel).range(colorsType);

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

	for (var i = 0; i < 10; ++i) simulation.tick();

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// dots
	const dots = svg
		.selectAll(".dots")
		.data(data)
		.enter()
		// cell
		.append("circle")
		.attr("class", "dots")
		.attr("r", 0)
		.attr("cx", (d) => d.x)
		.attr("cy", 0)
		.style("opacity", 0);

	dots
		.transition()
		.duration((d, i) => i * 50)
		.attr("r", radius)
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.attr("fill", (d) => cScale(d.attacker_jurisdiction))
		.style("opacity", 1);

	// tooltip
	// const tooltip = svg.append("div").classed("tooltip", true);
	const tooltip = selectOrCreate("div", "tooltip", d3.select("#app"));

	dots.on("mouseover", (event, d) => {
		// var mouseX = event.pageX + 5;
		// var mouseY = event.pageY + 5;
		var x = d.x;
		var y = d.y;
		// tooltip
		d3.select(".tooltip")
			.style("visibility", "visible")
			.style("opacity", 1)
			.style(
				"transform",
				`translate(
				calc(${x + margin.left}px - 50%),
				calc(${y + margin.top}px - 50%))`
			);
		// .style("left", mouseX + "px")
		// .style("top", mouseY + "px")
		// .text(d.name);
		// smoother change in opacity
		dots.transition().style("opacity", 0.5);
		// d3.select(event.target).style("opacity", 1);
		// d3.select(".tooltip h2").text(d.name);
	});

	dots.on("mousemove", (d, i) => {
		// var mouseX = event.pageX + 5;
		// var mouseY = event.pageY + 5;
		var x = d.x;
		var y = d.y;
		d3.select(".tooltip")
			// tooltip
			.style(
				"transform",
				`translate(
		calc(${x + margin.left}px - 80%), 
		calc(${y + margin.top}px - 50%))`
			)
			// .style("left", mouseX + "px")
			// .style("top", mouseY + "px")
			.text(d.name);
	});

	dots.on("mouseleave", function (d) {
		d3.select(".tooltip").style("visibility", "hidden");
		dots.transition().style("opacity", 1);
	});

	dots.on("click", on);

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

	var dataL = 0;
	var legendOffset = (width - 100) / dataType.length;

	var legend = d3
		.select(".legend")
		.append("svg")
		.attr("width", width)
		.attr("height", radius * 4);

	var drawLegend = legend
		.selectAll(".legend")
		.data(dataTypeLabel)
		.enter()
		.append("g")
		.attr("class", "legend")
		// .attr("transform", "translate(" + (width - cScale.length * 24) / 2 + ",10");
		.attr("transform", function (d, i) {
			if (i === 0) {
				dataL = d.length + legendOffset;
				return "translate(0,0)";
			} else {
				var newdataL = dataL;
				dataL += d.length + legendOffset;
				return "translate(" + newdataL + ",0)";
			}
		});

	drawLegend
		.append("circle")
		.attr("cx", radius)
		.attr("cy", radius)
		.attr("r", radius / 2)
		.style("fill", (d, i) => colorsType[i]);

	drawLegend
		.append("text")
		.attr("x", radius + radius)
		.attr("y", radius * 1.5)
		.text((d) => d)
		.attr("class", "textselected")
		.style("text-anchor", "start");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// details //////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	function on(f) {
		document.getElementById("overlay").style.display = "block";
		var detailsHtml = Mustache.render(template, f);
		d3.select("#overlay").html(detailsHtml);
		// d3.select("#overlay").classed("hidden", false);
	}

	// function off() {
	// 	document.getElementById("overlay").style.display = "none";
	// }
};

createChart();
