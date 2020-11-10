///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const { color } = require("d3");

// import * as d3 from "d3";
// import { easeBounceIn, easeCubic, easeExp, easePoly } from "d3";
// import { csv } from "d3-fetch";
// import _ from "lodash";

// import mustache
// https://github.com/janl/mustache.js
// const Mustache = require("mustache");

console.clear();

///////////////////////////////////////////////////////////////////////////
//////////////////////////// TODO /////////////////////////////
///////////////////////////////////////////////////////////////////////////

// wrap xaxis labels https://bl.ocks.org/mbostock/7555321

///////////////////////////////////////////////////////////////////////////
//////////////////////////// drawing function /////////////////////////////
///////////////////////////////////////////////////////////////////////////

const createChart = async () => {
	// const url = "https://eucyberdirect.eu/wp-content/uploads/2020/11/cpi_cyber_operations_database_2020_version-1.0.csv";
	const url = "./data/CPI_Cyber_Operations_Database_2020_Version 1.0.csv";

	//////////////////////////// data /////////////////////////////////////////

	let data = await d3.csv(url, (d) => {
		return {
			// order
			name: d.Name,
			cpi: d.CPI_CODE,
			// plotting
			startYear: +d.Start_year,
			reportDay: d.Report_day,
			reportMonth: d.Report_month,
			reportYear: d.Report_year,
			report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
			// labels
			dyad: d.Dyad,
			disputeType: d.Type_of_dispute,
			geopoliticalSetting: d.Geopolitical_setting,
			initialaccesEnterprise: d.Initial_access_MITRE_ATTCK_for_Enterprise,
			initialaccesICS: d.Initial_access_MITRE_ATTCK_for_ICS,
			impactEnterprise: d.Impact_MITRE_ATTCK_for_Enterprise,
			addImpactEnterprise: d.Additional_Impact_MITRE_ATTCK_for_Enterprise,
			impactICS: d.Impact_MITRE_ATTCK_for_ICS,
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
			attacker_jurisdiction: d.Attack_jurisdiction,
			target_jurisdiction: d.Target_jurisdiction,
			victim_jurisdiction: d.Victim_jurisdiction,
			// other for coloring
			military: d.Ongoing_military_confrontation,
			command: d.Attack_cyber_command.trim(),
			us_me: d.US_military_effects,
			sector_i: d.Target_CI_sector.trim(),
			sector_ii: d.Target_CI_sector_II.trim(),
			sector_iii: d.Target_CI_sector_III.trim(),
			url: d.url
		};
	});
	// console.log(data);

	//////////////////////////// accessors ////////////////////////////////////

	const col = "sector";
	const xAccessor = (d) => d.cpi;
	const yAccessor = (d) => d.sector;
	const cAccessor = (d) => d[col];

	//////////////////////////// Set up svg ///////////////////////////////////

	const wrapper = d3.select("#appSectors").append("svg");

	// if element already exists, return selection
	// if it doesn't exist, create it and give it class
	const selectOrCreate = (elementType, className, parent) => {
		const selection = parent.select("." + className);
		if (!selection.empty()) return selection;
		return parent.append(elementType).attr("class", className);
	};

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// update ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const update = () => {
		//////////////////////////// sizes ///////////////////////////////////
		const size = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

		let dimensions = {
			width: size,
			height: size * 0.66,
			margin: {
				top: 30,
				right: 100,
				bottom: 60,
				left: 100
			}
		};

		const radius = dimensions.width / 70;

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

		//////////////////////////// data /////////////////////////////////////////

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

		// long form for each sector
		var lo = _.flatten(data);
		data = [].concat.apply([], [lo, lo, lo]);

		// data.forEach((d, i, arr) => {
		// 	if (i < arr.length / 3) {
		// 		d.sector = d.sector_i;
		// 	} else if (i >= arr.length / 3 && i < (arr.length / 3) * 2) {
		// 		// d.sector = d.sector_ii;
		// 	} else if (i >= (arr.length / 3) * 2 && i < (arr.length / 3) * 3) {
		// 		// d.sector = d.sector_iii;
		// 	}
		// });

		data = data.map((d, i, arr) => {
			if (i < arr.length / 3) {
				return {
					name: d.name,
					cpi: d.cpi,
					startYear: d.startYear,
					reportLabel: d.reportLabel,
					sector: d.sector_i
				};
			} else if (i >= arr.length / 3 && i < (arr.length / 3) * 2) {
				return {
					name: d.name,
					cpi: d.cpi,
					startYear: d.startYear,
					reportLabel: d.reportLabel,
					sector: d.sector_ii
				};
			} else if (i >= (arr.length / 3) * 2 && i < (arr.length / 3) * 3) {
				return {
					name: d.name,
					cpi: d.cpi,
					startYear: d.startYear,
					reportLabel: d.reportLabel,
					sector: d.sector_iii
				};
			}
		});

		// console.log(data);
		// console.log([data[0].sector, data[23].sector, data[46].sector]);

		// drop "no"
		data = _.filter(data, (d) => d.sector !== "no");
		data = _.filter(data, (d) => d.sector !== "N/A");

		data.forEach((d) => d.cpi.split(/\s+/).reverse());
		// console.log(data);

		// wrapping functions
		const formatTextWrap = (text, maxLineLength) => {
			const words = text.replace(/[\r\n]+/g, " ").split(" ");
			let lineLength = 0;

			// use functional reduce, instead of for loop
			return words.reduce((result, word) => {
				if (lineLength + word.length >= maxLineLength) {
					lineLength = word.length;
					return result + `\n${word}`; // don't add spaces upfront
				} else {
					lineLength += word.length + (result ? 1 : 0);
					return result ? result + ` ${word}` : `${word}`; // add space only when needed
				}
			}, "");
		};

		let words = (text) => text.trim().split(/\s+/).reverse();

		// wrapping (not working)
		// data.forEach(d => formatTextWrap(d.sector, 10))
		data.forEach((d) => words(d.sector, 10));
		console.log(data);

		//////////////////////////// colors ///////////////////////////////////////

		const colorsType = [
			"#113655",
			"#1b4261",
			"#254e6c",
			"#2f5a78",
			"#3a6784",
			"#447490",
			"#4f819b",
			"#5b8ea7",
			"#669cb3",
			"#72aabf",
			"#7fb8cb",
			"#8cc6d7",
			"#99d4e3"
		];

		//////////////////////////// domains ///////////////////////////////////////

		var dataType = _.chain(data)
			.map((d) => d[col])
			.uniq()
			.value();

		var xValue = _.chain(data)
			.map((d) => d.cpi)
			.uniq()
			.value();

		//////////////////////////// scales ///////////////////////////////////////

		const xScale = d3
			.scalePoint()
			// .rangePoints([xValue])
			// .scaleBand()
			.domain(xValue)
			.range([0, dimensions.boundedWidth]);

		const yScale = d3
			.scalePoint()
			.domain(dataType)
			.range([dimensions.boundedHeight, 0]);

		const cScale = d3.scaleOrdinal().domain(dataType).range(colorsType);

		//////////////////////////// axes /////////////////////////////////////////

		// var formatAxis = d3.format(".4r");

		const xAxisGenerator = d3
			.axisBottom()
			.scale(xScale)
			.tickSize(-dimensions.boundedHeight - radius)
			.tickFormat((d) => d.substr(0, 4));

		const xAxis = selectOrCreate("g", "xAxis", bounds)
			// .style(
			// 	"transform",
			// 	`translate(${-radius * 1.5}px,${dimensions.boundedHeight}px)`
			// )
			.attr(
				"transform",
				"translate(" +
					// dimensions.margin.left +
					"0" +
					"," +
					(dimensions.boundedHeight + radius) +
					")"
			)
			.call(xAxisGenerator);
		// .selectAll(".tick text");
		// .call(wrap, xScale.domain());

		// console.log(data, d => xScale.domain(xAccessor(d)))

		const yAxisGenerator = d3
			.axisLeft()
			.scale(yScale)
			.tickSize(-dimensions.boundedWidth);
		// .tsickFormat(formatAxis)

		// const yAxis = selectOrCreate("g", "yAxis", bounds)
		// 	.attr("transform", "translate(" + -radius * 3 + "," + ",0)")
		// 	.call(yAxisGenerator);

		//////////////////////////// plot /////////////////////////////////////////

		// starting position
		const dots = (data) => {
			const tooltip = selectOrCreate(
				"div",
				"tooltip",
				d3.select("#appSectors")
			);

			const dots = bounds
				.selectAll(".dots")
				.data(data)
				.enter()
				// cell
				.append("circle")
				.attr("class", "dots")
				.attr("r", 0)
				.attr("cx", (d) => xScale(xAccessor(d)))
				.attr("cy", (d) => yScale(yAccessor(d)))
				.style("opacity", 0);

			const xlabels = bounds
				.selectAll(".xlabel")
				.data(data)
				.enter()
				.append("text")
				.attr("class", "xlabel")
				.attr("dy", ".35em")
				.attr("x", (d) => xScale(xAccessor(d)))
				.attr("y", (d) => yScale(yAccessor(d)) - radius * 1)
				.text((d) => formatTextWrap(d.sector, 10));

			// const labels = bounds
			// 	.selectAll(".label")
			// 	.data(data)
			// 	.enter()
			// 	.append("text")
			// 	.attr("class", "label")
			// 	.attr("x", (d) => xScale(xAccessor(d)))
			// 	.attr("y", (d) => yScale(yAccessor(d)) - radius * 1)
			// 	.text((d) => formatTextWrap(d.sector, 10));

			// animated drop
			dots
				.transition()
				.duration((d, i) => i * 50)
				.attr("r", radius)
				.attr("cx", (d) => xScale(xAccessor(d)))
				.attr("cy", (d) => yScale(yAccessor(d)))
				// .attr("fill", colorsType[0])
				.attr("fill", (d) => cScale(cAccessor(d)))
				.style("opacity", 1);

			// tooltip
			dots.on("mouseover", (event, d) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.text(d.name);
				// smoother change in opacity
				dots.transition().style("opacity", 0.5);
			});

			dots.on("mousemove", (d, i) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.text(d.name);
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
