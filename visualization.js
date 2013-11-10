//Design variables

//Width and height
var w = 500;
var h = 200;
var padding = 30;

//Size of datapoints
var radius_min = 5;
var radius_max = 10;

//See color_by_department to change color for each major/department
var color = d3.scale.category20();

//Test datasets
//TODO: have this loaded from outside static files?

var FTE = [
	   [15, "Afric Std"], 
	   [30, "Dance"], 
	   [40, "Amer Std"],
	   [35, "CMSC"]
	   ];


var FT_FAC = [
	      [2, "Afric Std"],
	      [9, "Dance"],
	      [12, "Amer Std"],
	      [0, "CMSC"]
	      ];

var PT_FAC = [
	      [4, "Afric Std"],
	      [2, "Dance"],
	      [9, "Amer Std"],
	      [10, "CMSC"]
	      ];

var xData = FT_FAC;
var yData = FTE;
var xData_label = "Full Time Faculty";
var yData_label = "Full Time Equivalent Student";

//Set Scales and Axis
//TODO: get max of each dataset

var xScale = d3.scale.linear()
    //.domain([0, 100])
    .domain([0, d3.max(get_values(xData))])
    .range([padding, w - padding]);

var yScale = d3.scale.linear()
    //.domain([0, 100])
    .domain([0, d3.max(get_values(yData))])
    .range([h - padding, padding]);

//Define X axis
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(5);  //Set rough # of ticks

//Define Y axis
var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(5);

//Create SVG element

var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//Create tooltip
var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");
    //    .text("a simple tooltip");

//Push Data Elements

//Determine radius from x-axis values, map between radius_min and radius_max
var min = d3.min(get_values(xData));
var max = d3.max(get_values(xData));

svg.selectAll("circle")
    .data(xData)
    .enter()
    .append("circle")
    .style("stroke", "gray")
    .style("fill", function(d){
	    return color_by_department(d[1]);
	})
    .attr("cx", function(d) {
	    return xScale(d[0]);
	})
    .attr("cy", function(d,i) {
	    return yScale(yData[i][0]);
	})
    .attr("r", function(d){
	    return scale_radius(d[0],min,max);
	})
    .on("mouseover", function(d,i){
	    tooltip.text(d[1] + "\n" + xData_label + ": " + d[0] + "\n" + yData_label+ ": " + yData[i][0]);
	    return tooltip.style("visibility", "visible");})
    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});


//Old tooltip    .append("svg:title")
//    .text(function(d,i){ return d[1] + "\n" + xData_label + ": " + d[0] + "\n" + yData_label+ ": " + yData[i][0]});
    
//Create X axis
svg.append("g")
    .attr("class", "x-axis")  //Assign "axis" class
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

//Create Y axis
svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);


d3.selectAll("input").on("change", function change() {
	
	if(this.value === "fte_xaxis"){
	    xData = FTE;
	    xData_label = "Full Time Equivalent Student";
	} else if (this.value === "ft_fac_xaxis"){
	    xData = FT_FAC;
	    xData_label = "Full Time Faculty";
	} else if (this.value === "pt_fac_xaxis"){
	    xData = PT_FAC;
	    xData_label = "Part Time Faculty";
	}
	else if (this.value === "fte_yaxis"){
	    yData = FTE;
	    yData_label = "Full Time Equivalent Student";
	}
	else if (this.value === "ft_fac_yaxis"){
	    yData = FT_FAC;
	    yData_label = "Full Time Faculty";
	}
	else if (this.value === "pt_fac_yaxis"){
	    yData = PT_FAC;
	    yData_label = "Part Time Faculty";
	}
	
	//Resize range for plotting new values and each axis
	xScale.domain([0, d3.max(get_values(xData))])
	    .range([padding, w - padding]);
	
	yScale.domain([0, d3.max(get_values(yData))])
	    .range([h - padding, padding]);

	//get min and max of new dataset to draw the radius
	var min = d3.min(get_values(xData));
	var max = d3.max(get_values(xData));


	var circles = svg.selectAll("circle")
	    .data(xData)
	    .transition()
	    .duration(750)
	    .attr("cx", function(d) {
		    return xScale(d[0]);
		})
	    .attr("cy", function(d,i) {
		    return yScale(yData[i][0]);
		})
	    .attr("r", function(d){
		    return scale_radius(d[0],min,max);
		});

	
	
	svg.select(".x-axis")
	    .transition()
	    .duration(750)
	    .call(xAxis);

	svg.select(".y-axis")
	    .transition()
	    .duration(750)
	    .call(yAxis);

    });

//////
// Helper Functions
//////

function scale_radius(val, min, max){
    return radius_min + (radius_max - radius_min) * (val - min)/(max - min);
}


function get_values(arr){
    var val_array = [];
    for (var i = 0; i < arr.length; i++) {
	val_array.push(arr[i][0]);
    }      
    return val_array;
}

function color_by_department(department){

    if(department === "Afric Std"){
	return color(0);
    } else if (department === "Dance"){
	return color(1);
    } else if (department === "Amer Std"){
	return color(2);
    } else if (department === "CMSC"){
	console.log(color(29));
	return color(29);
    }
}
