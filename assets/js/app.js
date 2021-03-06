// @TODO: YOUR CODE HERE!
var svgWidth = 800;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// d3.csv("assets/data/data.csv").then(function (healthData, err) {
//     console.log(healthData);

// function used for updating x-scale var upon click on axis label
    function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

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
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {

    var label;

    if (chosenXAxis === "in_poverty") {
        label = "In Poverty (%):";
    }
    else {
        label = "# of Albums:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });

    return circlesGroup;
    }


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.state = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
//   var xLinearScale = xScale(healthData, chosenXAxis);
    // Create x scale function
    var xLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.poverty)])
    .range([0, width]);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 15)
    .attr("fill", "lightblue")
    .attr("stroke", "white")
    .attr("opacity", ".7");
    // .text(function(d) {
  //     return d.abbr;
  // })

  // /// Append State Abbreviations to Circles
  // var abbrGroup = chartGroup.selectAll("texts")
  //   .data(healthData)
  //   .enter()
  //   .append("text")
  //   .attr("x", d => xLinearScale(d.poverty))
  //   .attr("y", d => yLinearScale(d.healthcare))
  //   .attr("class","stateText")
  //   .text(function(d) {
  //       return d.abbr;
  // })

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var in_povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "in_poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(d.poverty, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== d.poverty) {

        // replaces chosenXAxis with value
        d.poverty = value;

        // console.log(d.poverty)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, d.poverty);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, d.poverty);

        // updates tooltips with new info
        circlesGroup = updateToolTip(d.poverty, circlesGroup);

        // changes classes to change bold text
        if (d.poverty === "num_albums") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          in_povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          in_povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
})
.catch(function(error) {
  console.log(error);
});
