// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 660;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
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

// Initial Parameters
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(estimateACS, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(estimateACS, data => data.healthcare * 0.8),
        d3.max(estimateACS, data => data.healthcare * 1.2)])
        .range([chartHeight, 0])
        .range([0, chartWidth]);

    return xLinearScale;

}


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var label = "In Poverty (%)";
    }
    else {
        var label = "Age";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([120, -60])
        .html(function (d) {
            return (`${d.state}<br>Coverage: ${parseFloat(d.healthcare * 100).toFixed(1)
                } % <br>${label}${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (estimateACS) {
        toolTip.show(estimateACS);
    })
        // onmouseout event
        .on("mouseout", function (estimateACS, index) {
            toolTip.hide(estimateACS);
        });

    return circlesGroup;
}


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
    var xLinearScale = xScale(estimateACS, chosenXAxis);

    // d3.scaleLinear()
    // .domain([d3.min(estimateACS, data => data.poverty * 0.8), d3.max(estimateACS, data => data.poverty * 1.2)])
    // .range([0, chartWidth]);

    // Configure a linear scale with a range between the chartHeight and 0 (Y-axis)
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(estimateACS, data => data.healthcare * 0.8), d3.max(estimateACS, data => data.healthcare * 1.2)])
        .range([chartHeight, 0]);

    // Create initial axis function
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
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

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var incomeLenthLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Average Income Per US State");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Age per US State");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Health Insurance Coverage (percent)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(estimateACS, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLengthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLengthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });


    //                     // updateToolTip function above csv import
    //   var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //     // Append Initial Text
    //     var textGroup = chartGroup.selectAll('.stateText')
    //         .data(estimateACS)
    //         .enter()
    //         .append('text')
    //         .classed('stateText', true)
    //         .attr('x', d => xLinearScale(d.poverty))
    //         .attr('y', d => yLinearScale(d.healthcare))
    //         .attr('dy', 3)
    //         .attr('font-size', '10px')
    //         .text(function (d) { return d.abbr });

    //     //Create a group for X labels
    //     var xLabelsGroup = chartGroup.append('g')
    //         .attr('transform', `translate(${svgWidth / 2}, ${chartHeight + 10 + chartMargin.top})`);

    //     var povertyLabel = xLabelsGroup.append('text')
    //         .classed('aText', true)
    //         .classed('active', true)
    //         .attr('x', 0)
    //         .attr('y', 20)
    //         .attr('value', 'poverty')
    //         .text('In Poverty (%)');

    //     //Create a group for Y labels
    //     var yLabelsGroup = chartGroup.append('g')
    //         .attr('transform', `translate(${0 - chartMargin.left / 2}, ${chartHeight / 2})`);

    //     var healthcareLabel = yLabelsGroup.append('text')
    //         .classed('aText', true)
    //         .classed('active', true)
    //         .attr('x', 0)
    //         .attr('y', 0 - 20)
    //         .attr('dy', '1em')
    //         .attr('transform', 'rotate(-90)')
    //         .attr('value', 'healthcare')
    //         .text('Without Healthcare (%)')
