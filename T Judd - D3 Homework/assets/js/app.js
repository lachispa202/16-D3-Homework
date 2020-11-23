// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 660;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 180,
    left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Load data from hours-of-tv-watched.csv
d3.csv("assets/data/data.csv").then(function (estimateACS) {

    // Test data load
    console.log(estimateACS);

    // Parse data
    estimateACS.forEach(function (incomeData) {
        incomeData.income = +incomeData.income;
        incomeData.obesity = +incomeData.obesity;
        incomeData.smokes = +incomeData.smokes;
        incomeData.poverty = +incomeData.poverty;
        incomeData.healthcare = +incomeData.healthcare / 100;
        incomeData.age = +incomeData.age;
    });

    // Configure a linear scale with a range between the chart width and 0 (X-axis)
    var xLinearScale = d3.scaleTime()
        .domain([0, d3.max(estimateACS, data => data.poverty)])
        .range([0, chartWidth]);

    // Configure a linear scale with a range between the chartHeight and 0 (Y-axis)
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(estimateACS, data => data.healthcare * 0.8), d3.max(estimateACS, data => data.healthcare * 1.2)])
        .range([chartHeight, 0]);

    // Create initial axis function
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${svgHeight})`)
        .call(bottomAxis);

    // Append y-axis
    chartGroup.append("g")
        .call(leftAxis
            .ticks(10)
            .tickFormat(d3.format(",.1%")));

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(estimateACS)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
        .data(estimateACS)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d.poverty))
        .attr('y', d => yLinearScale(d.healthcare))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function (d) { return d.abbr });

    //Create a group for X labels
    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${svgWidth / 2}, ${svgHeight + 10 + chartMargin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');

    //Create a group for Y labels
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - chartMargin.left / 2}, ${svgHeight / 2})`);

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Without Healthcare (%)');






})

