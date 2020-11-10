///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
// import { csv } from "d3-fetch";

// import _ from "lodash";

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

	let data = {
		children: [
			{ children: [{ title: "Cyber espionage", val: 1000, desc: "" }] },
			{
				children: [{ title: "Military cyber operations", val: 100, desc: "" }]
			},
			{
				children: [
					{
						title: "Cyber operations against public trust",
						val: 5,
						desc:
							"targeting of international organizations, Internet infrastructure and trust(ed) services"
					}
				]
			},
			{
				children: [
					{
						title: "Effect-creating cyber operations",
						val: 23,
						desc:
							"State-authorized defacements, DDoS, doxing, data destruction and sabotage"
					}
				]
			},
			{
				children: [
					{
						title: "Domestic cyber conflict",
						val: 300,
						desc:
							"internet shutdowns, opposition targeting, systemic violations of human rights"
					}
				]
			}
		]
	};

	//////////////////////////// accessors ////////////////////////////////////

	const col = "title";
	// const xAccessor = (d) => d.startYear;
	const cAccessor = (d) => d[col];
	const xAccessor = (d) => d[col];
	const yAccessor = (d) => d[col];
	const rAccessor = (d) => d.val;
	const tAccessor = (d) => d.startYear;
	const vAccessor = (d) => d.startYear;

	//////////////////////////// Set up svg ///////////////////////////////////

	const wrapper = d3.select("#appTypes").append("svg");

	// if element already exists, return selection
	// if it doesn't exist, create it and give it class
	const selectOrCreate = (elementType, className, parent) => {
		const selection = parent.select("." + className);
		if (!selection.empty()) return selection;
		return parent.append(elementType).attr("class", className);
	};

	const update = () => {
		//////////////////////////// sizes ///////////////////////////////////
		const size = d3.min([window.innerWidth * 0.99, window.innerHeight * 0.99]);

		let dimensions = {
			width: size,
			height: size,
			margin: {
				top: 15,
				right: 15,
				bottom: 60,
				left: 60
			}
		};

		dimensions.boundedWidth =
			dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight =
			dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		//////////////////////////// svg ///////////////////////////////////

		// tag = name; class = .name; id = #name;
		wrapper.attr("width", dimensions.width).attr("height", dimensions.height);

		// shifting
		const bounds = selectOrCreate("g", "wrapper", wrapper).style(
			"transform",
			`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
		);

		//////////////////////////// colors ///////////////////////////////////////

		const colorsType = [
			"#113655",
			"#f28c00",
			"#3f8ca5",
			"#fab85f",
			"#99d4e3",
			"#fed061"
		];

		//////////////////////////// col var ///////////////////////////////////////

		var dataType = _.chain(data.children.title)
			.map((d) => d[col])
			.uniq()
			.value();
		// console.log(dataType);

		//////////////////////////// scales ///////////////////////////////////////

		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(data, xAccessor))
			.range([0, dimensions.boundedWidth])
			.nice();

		const yScale = d3
			.scaleLinear()
			.domain(d3.extent(data, yAccessor))
			.range([dimensions.boundedHeight, 0])
			.nice();

		const rScale = d3
			.scaleSqrt()
			.domain(d3.extent(data, rAccessor))
			.range([10, dimensions.boundedHeight / 2]);

		const cScale = d3
			.scaleOrdinal()
			.domain([
				"Cyber espionage",
				"Military cyber operations",
				"Cyber operations against public trust",
				"Effect-creating cyber operations",
				"Domestic cyber conflict"
			])
			.range(colorsType);

		//////////////////////////// force ///////////////////////////////////////

		// var root = d3
		// 	.hierarchy(data)
		// 	.sum((d) => (d.hasOwnProperty("val") ? d.val : 0))
		// 	.sort((a, b) => b.value - a.value);

		// var partition = d3.pack().size([500, 500]);

		// partition(root);

		// console.log(root);
		// console.log(root.descendants());

		var simulation = d3
			.forceSimulation(data)
			.force(
				"center",
				d3
					.forceCenter()
					.x(dimensions.boundedWidth / 2)
					.y(dimensions.boundedHeight / 2)
			)
			.force("charge", d3.forceManyBody().strength(0.5))
			// .force("x", d3.forceX((d) => xScale(0)).strength(0.99))
			// .force("y", d3.forceY((d) => yScale(0)).strength(0.05))
			.force(
				"collide",
				d3
					.forceCollide()
					.strength(0.1)
					.radius((d) => rScale(rAccessor(data)))
			)
			// .iterations(1)
			.stop();

		// for (var i = 0; i < 10; ++i) simulation.tick();

		simulation.nodes(data).on("tick", (d) => {
			dots.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
		});

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// plot /////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		const dots = (data) => {
			const tooltip = selectOrCreate("div", "tooltip", d3.select("#appTypes"));

			const dots = bounds
				.selectAll(".dots")
				// .data(root.descendants())
				.data(data)
				.enter()
				.append("circle")
				.classed("node", true)
				// .attr("cx", (d) => d.x)
				// .attr("cy", (d) => d.y)
				// .attr("r", (d) => d.r)
				.attr("cx", dimensions.boundedWidth / 2)
				.attr("cy", dimensions.boundedHeight / 2)
				.attr("r", (d) => rScale(rAccessor(d)))
				// .attr("fill", (d) => cScale(cAccessor(d)))
				.style("fill", (d) => cScale(cAccessor(d)))
				.style("fill-opacity", 0.25)
				.attr("stroke", (d) => cScale(cAccessor(d)))
				.attr("stroke-width", "5px");
			// .style("opacity", 0.1);
			// .style("fill", "rgba(0, 0, 0,0)")
			// .style("stroke", "10px solid");

			// tooltip
			dots.on("mouseover", (event, d) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					// .text(d.key);
					.text(d.title);
				// smoother change in opacity
				dots.transition().style("opacity", 0.5);
			});

			dots.on("mousemove", (d, i) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.text(d.title);
			});

			dots.on("mouseleave", function (d) {
				d3.select(".tooltip").style("visibility", "hidden");
				dots.transition().style("opacity", 1);
			});
		};
		dots(data);
	};

	update();
};

createChart();
