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
	forceSimulation,
	forceLink,
	forceManyBody,
	forceX,
	forceY
} from "d3";

// import _ from "lodash";
// Load the core build.
import { chain, replace, split, uniqBy, filter } from "lodash";

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
	"data/EUISS Database.csv";

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
		command: d.Attack_cyber_command.trimEnd(),
		us_me: d.US_military_effects
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
	var nodes = data;
	const links = data;
	// console.log(nodes);

	var nodesFromUnique = chain(nodes)
		.uniqBy((d) => d.dyad_from)
		.value();
	// console.log(nodesFromUnique);

	var nodesToUnique = chain(nodes)
		.uniqBy((d) => d.dyad_to)
		.value();
	// console.log(nodesToUnique);

	var nodesUnique = chain(nodes)
		.map((d) => [d.dyad_from, d.dyad_to])
		.flatten()
		.uniq()
		.value();
	// console.log(nodesUnique);

	// const obj = nodesUnique.reduce((array, value, index) => ({ ...array, [index]: value }), {});

	nodes = nodesUnique.map((d) => {
		return { id: d };
	});
	// console.log(nodes);

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

	// const links = data.links.map(d => data.create(d));
	// const nodes = data.nodes.map(d => nodes.create(d));

	var simulation = forceSimulation(nodes)
		.force(
			"links",
			forceLink(links).id((d) => d.dyad_from)
		)
		.force("charge", forceManyBody())
		.force("x", forceX())
		.force("y", forceY());

	const link = svg
		.append("g")
		// .attr("stroke", "#999")
		// .attr("stroke-opacity", 0.6)
		.selectAll("line")
		.data(links)
		.join("line")
		.attr("stroke", (d) => d.command);
	// .attr("stroke-width", (d) => Math.sqrt(d.value));

	const node = svg
		.append("g")
		.attr("stroke", "#fff")
		.attr("stroke-width", 1.5)
		.selectAll("circle")
		.data(nodes)
		.join("circle")
		.attr("r", 5)
		.attr("fill", "black");
	// .call(drag(simulation));

	node.append("title").text((d) => d.id);

	simulation.on("tick", () => {
		link
			.attr("x1", (d) => d.source.x)
			.attr("y1", (d) => d.source.y)
			.attr("x2", (d) => d.target.x)
			.attr("y2", (d) => d.target.y);

		node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
	});

	// invalidation.then(() => simulation.stop());

	// var drag = function (simulation) {
	// 	function dragstarted(d) {
	// 		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	// 		d.fx = d.x;
	// 		d.fy = d.y;
	// 	}

	// 	function dragged(d) {
	// 		d.fx = d3.event.x;
	// 		d.fy = d3.event.y;
	// 	}

	// 	function dragended(d) {
	// 		if (!d3.event.active) simulation.alphaTarget(0);
	// 		d.fx = null;
	// 		d.fy = null;
	// 	}

	// 	return d3
	// 		.drag()
	// 		.on("start", dragstarted)
	// 		.on("drag", dragged)
	// 		.on("end", dragended);
	// };

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
});
