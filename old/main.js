///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// yaxis domain()
// xaxis annual ticks
// linerange (d3.line x.begin x.end?!)...
// labels()
// hover
// dropdown selection
// load data at end as global var after plot function

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
import { filter, chain } from "lodash";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = innerWidth;
const height = 300;
const margin = { top: 20, right: 20, bottom: 20, left: 120 };
const svg = select("#app") // id app
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
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vS_852u619EmtHZE3p4sq7ZXwfrtxhOc1IlldXIu7z43OFVTtVZ1A577RbfgZEnzVhM_X0rnkGzxytz/pub?gid=0&single=true&output=csv";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

csv(url, d => {
	return {
		id: d.CPI,
		name: d.Name,
		name_alt: d.name_alternative,
		start: new Date(+d.start_year, +d.start_month, +d.start_day),
		end: new Date(+d.end_year, +d.end_month, +d.end_day),
		report: new Date(+d.report_year, +d.report_month, +d.report_day),
		attacker_jurisdiction: d.attacker_jurisdiction,
		target_jurisdiction: d.target_jurisdiction,
		victim_jurisdiction: d.victim_jurisdiction,
		us_md: d.us_md
	};
}).then(function(data) {
	// data = _.head(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data table ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// d3.select("#output").text(
	// 	data[0].id + " " + data[0].name + " " + data[0].start
	// );

	// dropping missing dates (defaults to 1899 otherwise)
	data = filter(data, d => {
		return d.end > new Date("2000-01-01");
	});

	// new time formats for tooltip
	var formatDate = timeFormat("%d %b %Y");
	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// x - dates of attacks
	const dataDates = chain(data)
		// pick all date properties
		.map(d => [d.start, d.end, d.report])
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
		.map(d => d.attacker_jurisdiction)
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
		.map(d => d.us_md)
		.uniq()
		.value();
	// console.log(dataType);
	const colorScale = scaleOrdinal()
		.domain(dataType)
		.range(colorsType);
	// checking whether it computed correctly
	// console.log(colorScale.domain(), colorScale.range());

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// lines
	var line = _line()
		.curve(curveBasis)
		.x(d => xScale(d.start))
		.y(d => yScale(d.attacker_jurisdiction));

	var linerange = svg
		.selectAll("path.linerange")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "linerange");

	linerange
		.append("path")
		.attr("d", function(d) {
			return line(d.attacker_jurisdiction);
		})
		.attr("id", d => d.attacker_jurisdiction);
	// .style("stroke", function(d, i) { return z(i); });

	// labels
	// const labels = svg
	// 	.selectAll("label")
	// 	.data(data)
	// 	.enter()
	// 	.append("text")
	// 	.classed("label", true)
	// 	.text(d => d.name)
	// 	.attr("x", d => xScale(d.start) + 6)
	// 	.attr("y", d => yScale(d.attacker_jurisdiction) + 15);

	// dots
	const dots = svg
		.selectAll("dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", d => xScale(d.start))
		.attr("cy", d => yScale(d.attacker_jurisdiction) + 12)
		.attr("fill", d => colorScale(d.us_md))
		// tooltip
		.on("mouseover", (d, i) => {
			// console.log(d);
			// name
			select(".tooltip h2").text(d.name);
			// date
			select(".tooltip .date").text(
				"from " + formatDate(d.start) + " to " + formatDate(d.end)
			);
			// name
			select(".tooltip .type").text("type: " + d.us_md);
			// attacker
			select(".tooltip .attacker").text("attacker: " + d.attacker_jurisdiction);
			// victim
			select(".tooltip .target").text("target: " + d.name);
		});

	// move tooltip to cursor location
	d3.select(".tooltip")
		.style("left", d3.mouse.x + "px")
		// .style("left", d3.mouse.x + "px")
		.style("top", d3.mouse.y + "px");

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
