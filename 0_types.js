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

///////////////////////////////////////////////////////////////////////////
//////////////////////////// drawing function /////////////////////////////
///////////////////////////////////////////////////////////////////////////

const createChart = async () => {
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	let data = [
		{ title: "Cyber espionage", val: 1000, desc: "" },
		{ title: "Military cyber operations", val: 100, desc: "" },
		{
			title: "Cyber operations against public trust",
			val: 5,
			desc:
				"targeting of international organizations, Internet infrastructure and trust(ed) services"
		},
		{
			title: "Effect-creating cyber operations",
			val: 23,
			desc:
				"State-authorized defacements, DDoS, doxing, data destruction and sabotage"
		},
		{
			title: "Domestic cyber conflict",
			val: 300,
			desc:
				"internet shutdowns, opposition targeting, systemic violations of human rights"
		}
	];

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// accessor functions ///////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const rAcc = (d) => d.val;
	const tAcc = (d) => d.startYear;
	const vAcc = (d) => d.startYear;

	console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up svg ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);
	const height = d3.min([window.innerWidth * 0.33, window.innerHeight * 0.33]);
	const margin = { top: 20, right: 20, bottom: 20, left: 120 };

	const svg = d3
		.select("#types") // id app
		.append("svg")
		.attr("viewBox", [-margin.left, 0, width + width - 800, height])
		.style("overflow", "visible");

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const xScale = d3
		.scaleLinear()
		.domain(0)
		.range([margin.left, width - margin.right]);

	const yScale = d3
		.scaleLinear()
		.domain(0)
		.range([margin.top, height - margin.bottom]);

	const rScale = d3
		.scaleSqrt()
		.domain(d3.extent(data, (d) => d.val))
		.range([10, height / 2]);

	// console.log(xScale.domain(), xScale.range());

	var simulation = d3
		.forceSimulation(data)
		.force("x", d3.forceX((d) => xScale(d.val)).strength(0.99))
		.force("y", d3.forceY((d) => yScale(d.val)).strength(0.05))
		.force("collide", d3.forceCollide(rScale(rAcc(data))))
		.stop();

	for (var i = 0; i < 10; ++i) simulation.tick();

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const tooltip = d3
		.select(".tooltip")
		.style("visibility", "visible")
		.style("opacity", 1);

	// dots
	const dots = svg
		.selectAll(".dots")
		.data(data)
		.enter()
		// cell
		.append("circle")
		.attr("class", "dots")
		.attr("r", (d) => rScale(d.val))
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.attr("fill", "#3f8ca5")
		// tooltip
		.on("mouseenter", (event, d) => {
			const mouseX = xScale((d) => d.val);
			const mouseY = yScale((d) => d.val);
			// var mouseX = event.pageX + 10;
			// var mouseY = event.pageY + 10;
			tooltip
				.style(
					"transform",
					`translate(
            calc(${mouseX + margin.left}px - 50%), 
            calc(${mouseY + margin.top}px - 5%))`
				)
				.text(d.name);
			// name
			// d3.select(".tooltip h2").text(d.name);
		})
		.on("mouseleave", function (d) {
			d3.select(".tooltip").style("visibility", "hidden");
		});
};

createChart();
