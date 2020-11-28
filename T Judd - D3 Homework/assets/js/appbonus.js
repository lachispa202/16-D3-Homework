// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 700;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 150
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
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(estimateACS, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(estimateACS, d => d[chosenXAxis] * 0.8),
        d3.max(estimateACS, d => d[chosenXAxis] * 1.2)])
        .range([0, chartWidth]);

    return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// A function for updating y-scale variable upon click of label
function yScale(estimateACS, chosenYAxis) {
    //scales
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(estimateACS, d => d[chosenYAxis] * 0.8),
        d3.max(estimateACS, d => d[chosenYAxis] * 1.2)])
        .range([chartHeight, 0]);

    return yLinearScale;
}

//function used for updating yAxis variable upon click
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(2000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chosenXAxis]))
        .attr('cy', data => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(2000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]))

    return textGroup;
}

//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //style based on variable
    //poverty
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
        return `${value}`;
    }
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xLabel = "In Poverty (%)";
    }

    //income
    else if (chosenXAxis === 'income') {
        var xLabel = 'Median Income:';
    }

    //age
    else {
        var xLabel = "Age";
    }

    //Y label
    if (chosenYAxis === 'healthcare') {
        var yLabel = "Without Healthcare:"
    }
    //Obesity
    else if (chosenYAxis === 'obesity') {
        var yLabel = 'Obesity:';
    }

    //smoking
    else {
        var yLabel = 'Smokers:';
    }

    //create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    //add
    circlesGroup.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    return circlesGroup;
}

// Load data from .csv
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
    var yLinearScale = yScale(estimateACS, chosenYAxis);

    // Create initial axis function
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Append y-axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis)


    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(estimateACS)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
        .data(estimateACS)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .attr('font-size', '10px')
        .text(function (d) { return d.abbr });

    // Create group for  2 x- axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');

    var ageLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .text('Age (Median)');

    var incomeLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')

    //create a group for Y labels
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - chartMargin.left / 2}, ${chartHeight / 2})`);

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Without Healthcare (%)');

    var smokesLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 40)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes')
        .text('Smoker (%)');

    var obesityLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')
        .text('Obese (%)');

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis event listener
    xLabelsGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');

            if (value != chosenXAxis) {

                //replace chosen x with a value
                chosenXAxis = value;

                //update x for new data
                xLinearScale = xScale(estimateACS, chosenXAxis);

                //update x 
                xAxis = renderXAxis(xLinearScale, xAxis);

                //upate circles with a new x value
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text 
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update tooltip
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                //change of classes changes text
                if (chosenXAxis === 'poverty') {
                    povertyLabel.classed('active', true).classed('inactive', false);
                    ageLabel.classed('active', false).classed('inactive', true);
                    incomeLabel.classed('active', false).classed('inactive', true);
                }
                else if (chosenXAxis === 'age') {
                    povertyLabel.classed('active', false).classed('inactive', true);
                    ageLabel.classed('active', true).classed('inactive', false);
                    incomeLabel.classed('active', false).classed('inactive', true);
                }
                else {
                    povertyLabel.classed('active', false).classed('inactive', true);
                    ageLabel.classed('active', false).classed('inactive', true);
                    incomeLabel.classed('active', true).classed('inactive', false);
                }
            }
        });

    //y axis lables event listener
    yLabelsGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');

            if (value != chosenYAxis) {
                //replace chosenY with value  
                chosenYAxis = value;

                //update Y scale
                yLinearScale = yScale(estimateACS, chosenYAxis);

                //update Y axis 
                yAxis = renderYAxis(yLinearScale, yAxis);

                //Udate CIRCLES with new y
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update TEXT with new Y values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update tooltips
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                //Change of the classes changes text
                if (chosenYAxis === 'obesity') {
                    obesityLabel.classed('active', true).classed('inactive', false);
                    smokesLabel.classed('active', false).classed('inactive', true);
                    healthcareLabel.classed('active', false).classed('inactive', true);
                }
                else if (chosenYAxis === 'smokes') {
                    obesityLabel.classed('active', false).classed('inactive', true);
                    smokesLabel.classed('active', true).classed('inactive', false);
                    healthcareLabel.classed('active', false).classed('inactive', true);
                }
                else {
                    obesityLabel.classed('active', false).classed('inactive', true);
                    smokesLabel.classed('active', false).classed('inactive', true);
                    healthcareLabel.classed('active', true).classed('inactive', false);
                }
            }
        });
});
