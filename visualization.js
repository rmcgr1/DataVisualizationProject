//Design variables

//Width and height
var w = 750;
var h = 500;
var padding = 30;

//Size of datapoints
var radius_min = 100;
var radius_max = 700;

//var color = d3.scale.category20();

var color = function(){
    return d3.rgb("#6baed6")
};

// Selection groups, which identify their columns
var sel_indexes = [7, 8, 9, 20, 21, 22, 31, '',10, 11, 15]
    var sel_labels = [
		      "Undergrad Majors",
		      "Grad Majors",
		      "Total Majors",
		      "Full Time Undergrad",
		      "Full Time Grad",
		      "Full Time Total",
		      "Research Funding",
		      "Space Available",
		      "Full Time Employee",
		      "Part Time Employee",
		      "T/TT Employee"
		      ];

// Title, Color, Shape, in order of 0 to 4 as majors are labelled
var departments = [
		   ["CAHSS", 1, "circle"],
		   ["CNMS", 2, "cross"],
		   ["COEIT", 3, "diamond"],
		   ["Erickson", 4, "square"],
		   ["Sch of Soc Work", 5, "triangle-up"]
		   ];

var lines = [["Median", "#ff7f0e", "x-median"], ["Mean", "#d62728","x-mean"]]

    // Quick Generate a Legend
    legend = d3.select("#legend")
    .append("svg")
    .attr("width", 100)
    //    .attr("height", 115);
    .attr("height", 160);
        
legend.selectAll("point")
    .data(departments)
    .enter()
    .append("svg:path")
    .attr("class", "point")
    .attr("transform", function(d,i) { 
	    return "translate(12," + ((i+1)*20+2) + ")"; }
	)
    .attr("d", d3.svg.symbol().size(125).type(function(d) { return d[2]; }))
    .style("fill", function(d, i){
	    return color(departments[i][1]);
	})
    .style("stroke-width", ".5px");

legend.selectAll("text")
    .data(departments)
    .enter()
    .append("text")
    .attr("dx", "26px")
    .attr("dy", function(d,i) {
	    return ((i+1)*20)+6;
	})
    .text(function(d, i){
	    return d[0];
	});

// Add legend for median, mean lines
legend.selectAll("text-lines")
    .data(lines)
    .enter()
    .append("text")
    .attr("dx", "26px")
    .attr("dy", function(d,i) {
	    return (((departments.length)*20)+6) + ((i+1)*20)+6;
	})
    .text(function(d, i){
	    console.log(d[0]);
	    return d[0];
	});

legend.selectAll("point-lines")
    .data(lines)
    .enter()
    .append("svg:line")
    .attr("class", function(d){
	    return d[2];
	})
    .attr("x1", "4px")
    .attr("y1", function(d,i) { 
	    return departments.length*20+2 + (i + 1) * 20 + 4; 
	})
    .attr("x2", "20px")
    .attr("y2", function(d,i) { 
	    return departments.length*20+2 + (i + 1) * 20 + 4; 
	})
    .style("stroke", function(d){
	    return d[1];
	});



// Initialize all arrays
var alldata = new Array();

var x_median = 0;
var y_median = 0;
var x_mean = 0;
var y_mean = 0;

//Index of the denominator
var denom = 10;

// Initial Indexes and variables
var xind = 22;
var yind = 9;
var year_select = "2013";
var student_ind = 9;
var student_arr = new Array();

var xScale = 0;
var yScale = 0;
var xData = new Array();
var yData = new Array();
var parsedData = new Array();
var xData_label_numerator = '';
var xData_label_denominator = '';
var yData_label_denominator = '';
var xAxis = 0;
var yAxis = 0;
var svg = 0;
var min = 0;
var max = 0;
var event = window.event;

//TT to non-TT ratio average
var TT_average = 0;

//Create tooltip
tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("opacity", 0);
// .text("a simple tooltip");

//Load CSV, and set the data arrays
d3.text("alldata.csv", function(unParsed)
	{        
	    parsedData = d3.csv.parseRows(unParsed);
	    
	    for(var i = 0; i < parsedData.length; i++){
		for(var j = 1; j < parsedData[i].length; j++){
		    parsedData[i][j] = parseFloat(parsedData[i][j].replace(',', ''));
		}
	    }
	    
	    set_data();

	    xData = get_ratio_values(xind, denom);
	    yData = get_ratio_values(yind, denom);

	    xScale = d3.scale.linear()
		//.domain([0, 100])
		.domain([0, d3.max(xData, function(d){
				return d[0];
			    })])
		.range([padding, w - padding]);

	    yScale = d3.scale.linear()
		//.domain([0, 100])
		.domain([0, d3.max(yData, function(d){
				return d[0];
			    })])
		.range([h - padding, padding]);

	    //Define X axis
	    xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5); //Set rough # of ticks

	    //Define Y axis
	    yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(5);

	    //Create SVG element
	    svg = d3.select("#scatter")
		.append("svg")
		.attr("width", w)
		.attr("height", h);


	    xData_label_numerator = "Full Time Enrollments";
	    xData_label_denominator = "Full Time Faculty";
	    yData_label_numerator = "Total Majors";
	    yData_label_denominator = "Full Time Faculty";

	    //Determine radius from x-axis values, map between radius_min and radius_max
	    min = d3.min(get_values(student_ind));
	    max = d3.max(get_values(student_ind));

	    //Determine x and y medians
	    x_median = d3.median(xData, function(d){
		    return d[0];
		});
	    y_median = d3.median(yData, function(d){
		    return d[0];
		});
	    x_mean = d3.mean(xData, function(d){
		    return d[0];
		});
	    y_mean = d3.mean(yData, function(d){
		    return d[0];
		});
		
		
	    // Draw Median-Mean Lines
	    // Orange
	    xMedian = svg.append("svg:line")
		.attr("x1", xScale(x_median))
		.attr("y1", 0 + padding)
		.attr("x2", xScale(x_median))
		.attr("y2", h - padding)
		.attr("class", "x-median")
		.style("stroke-width","2")
		.style("stroke", "#ff7f0e");

	    yMedian = svg.append("svg:line")
		.attr("x1", 0 + padding)
		.attr("y1", yScale(y_median))
		.attr("x2", w - padding)
		.attr("y2", yScale(y_median))
		.attr("class", "y-median")
		.style("stroke-width","2")
		.style("stroke", "#ff7f0e");
   
	    // Red
	    xMean = svg.append("svg:line")
		.attr("x1", xScale(x_mean))
		.attr("y1", 0 + padding)
		.attr("x2", xScale(x_mean))
		.attr("y2", h - padding)
		.attr("class", "x-mean")
		.style("stroke-width","2")
		.style("stroke", "#d62728");

	    yMean = svg.append("svg:line")
		.attr("x1", 0 + padding)
		.attr("y1", yScale(y_mean))
		.attr("x2", w - padding)
		.attr("y2", yScale(y_mean))
		.attr("class", "y-mean")
		.style("stroke-width","2")
		.style("stroke", "#d62728");

	    // Set TT ratios for color
	    get_TT_average();
	
	    svg.selectAll("point")
		.data(xData)
		.enter()
		.append("svg:path")
		.attr("class", "point")
		.attr("transform", function(d,i) {
			x_val = xScale(d[0]);
			y_val = yScale(yData[i][0]);
			return "translate(" + x_val + "," + y_val + ")"; }
		    )
		.attr("d", d3.svg.symbol().size(function(d, i){  return scale_radius(alldata[i][9],min,max); }).type(function(d, i){ 
			    var dep_ind = alldata[i][2];
			    return departments[dep_ind][2]; 
			}))
		.style("fill", function(d, i){
			var dep_ind = alldata[i][2];
			var TT_ratio = alldata[i][15] / (alldata[i][10] + alldata[i][11]);
			return color_by_TT_ratio(TT_ratio, color(departments[dep_ind][1]));
		    })
		.style("stroke-width", ".6px")
		.style("stroke", "#000000")
		.on("mouseover", function(d,i){
			tooltip.transition()
			    .duration(200)
			    .style("opacity", .9);
			tooltip .html("<b>" + alldata[i][0] + " </b><br/>" 
				      + xData_label_numerator +": " + (alldata[i][xind]).toFixed(1) + "/" + xData_label_denominator +": " + (alldata[i][denom]).toFixed(1) + "<br/><br/>" + yData_label_numerator +": " + (alldata[i][yind]).toFixed(1) + "/" + yData_label_denominator + ": " + (alldata[i][denom]).toFixed(1))
			    .style("visibility", "visible");
		    })
		.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
		.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

	    //Create X axis
	    svg.append("g")
		.attr("class", "x-axis") //Assign "axis" class
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);

	    //Create Y axis
	    svg.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);

	});

//d3.selectAll("input").on("change", function change() {
$('input[type=radio]').change(function(){

        if(this.name == "yval"){
	    yind = sel_indexes[this.value];
	    yData_label_numerator = sel_labels[this.value];
        }else if(this.name == "xval"){
	    xind = sel_indexes[this.value];
	    xData_label_numerator = sel_labels[this.value];
        }else if(this.name == "year"){
	    year_select = this.value;
	    set_data();
        }else if(this.name == "emp"){
	    denom = sel_indexes[this.value];
	    yData_label_denominator = sel_labels[this.value];
	    xData_label_denominator = sel_labels[this.value];
        }

        xData = get_ratio_values(xind, denom);
        yData = get_ratio_values(yind, denom);

        //Resize range for plotting new values and each axis
        xScale.domain([0, d3.max(xData, function(d){
			return d[0];
		    })])
	    .range([padding, w - padding]);
        
        yScale.domain([0, d3.max(yData, function(d){
			return d[0];
		    })])
	    .range([h - padding, padding]);

	// Set TT ratios for color
	get_TT_average();

	var point = svg.selectAll(".point")
	    .data(xData)
	    .transition()
	    .duration(500)
	    .attr("transform", function(d,i) {
		    x_val = xScale(d[0]);
		    y_val = yScale(yData[i][0]);
		    return "translate(" + x_val + "," + y_val + ")"; }
		)
	    .style("fill", function(d, i){
		    var dep_ind = alldata[i][2];
		    var TT_ratio = alldata[i][15] / (alldata[i][10] + alldata[i][11]);
		    return color_by_TT_ratio(TT_ratio, color(departments[dep_ind][1]));
		});
        
        svg.select(".x-axis")
	    .transition()
	    .duration(750)
	    .call(xAxis);

        svg.select(".y-axis")
	    .transition()
	    .duration(750)
	    .call(yAxis);
     
	//Determine x and y medians
        x_median = d3.median(xData, function(d){
		return d[0];
	    });
        y_median = d3.median(yData, function(d){
		return d[0];
	    });
	x_mean = d3.mean(xData, function(d){
                return d[0];
	    });
	y_mean = d3.mean(yData, function(d){
                return d[0];
	    });
		
        // Draw Median Lines
        xMedian = svg.select(".x-median")
	    .transition()
	    .duration(500)
	    .attr("x1", xScale(x_median))
	    .attr("y1", 0 + padding)
	    .attr("x2", xScale(x_median))
	    .attr("y2", h - padding)
	    .attr("class", "x-median")
	    .style("stroke-width","2")
	    .style("stroke", "#ff7f0e");


        yMedian = svg.select(".y-median")
	    .transition()
	    .duration(500)
	    .attr("x1", 0 + padding)
	    .attr("y1", yScale(y_median))
	    .attr("x2", w - padding)
	    .attr("y2", yScale(y_median))
	    .attr("class", "y-median")
	    .style("stroke-width","2")
	    .style("stroke", "#ff7f0e");
	    

	xMean = svg.select(".x-mean")
	    .transition()
	    .duration(500)
	    .attr("x1", xScale(x_mean))
	    .attr("y1", 0 + padding)
	    .attr("x2", xScale(x_mean))
	    .attr("y2", h - padding)
	    .attr("class", "x-mean")
	    .style("stroke-width","2")
	    .style("stroke", "#d62728");


	yMean = svg.select(".y-mean")
	    .transition()
	    .duration(500)
	    .attr("x1", 0 + padding)
	    .attr("y1", yScale(y_mean))
	    .attr("x2", w - padding)
	    .attr("y2", yScale(y_mean))
	    .attr("class", "y-mean")
	    .style("stroke-width","2")
	    .style("stroke", "#d62728");

    });

//////
// Helper Functions
//////

function scale_radius(valindex, min, max){
    if(min == max){
        console.log("Warning: scaling radius with min value == max value, setting max = min * 2");
        max = min * 2;
    }
    return  ((valindex/(max)) * radius_max) + radius_min;
}

// Modified to use universal array
function get_ratio_values(nindex, dindex){
    var ratio_arr = [];
    for (var i = 0; i < alldata.length; i++){
	if(alldata[i][nindex] == 0){
	    ratio_arr.push([0, alldata[i][0]]);
	} else if(alldata[i][dindex] == 0){
	    ratio_arr.push([0, alldata[i][0]]);
	}else{
	    ratio_arr.push([(alldata[i][nindex] / alldata[i][dindex]), alldata[i][0]]);
	}
    }
    return ratio_arr;
}

function get_values(valindex){
    var val_array = [];
    for (var i = 0; i < alldata.length; i++) {
	val_array.push(parseFloat(alldata[i][valindex]));
    }
    return val_array;
}

// Make lightness a function of the ratio of T/TT faculty to non-T/TT faculty
// In the data: 15 / (10+11) for T/TT to non-TT
// The function takes the current lightness value of the color, and scales it up or down the percentage of its TT ratio that is away from the mean
// Ex: TT_ratio is .2, the average is .5, then the lightness value is scaled down .3 of its previous value. 
function color_by_TT_ratio(TT_ratio, rgb_color){
    var hsl_color = d3.hsl(rgb_color);
    var lightness = hsl_color.l;
    var scale_factor = TT_ratio - TT_average;
    var lightness_to_scale = 0;

    if(scale_factor > 0){
	lightness_to_scale = 1 - lightness;
    } else{
	lightness_to_scale = lightness;
    }

    hsl_color.l = hsl_color.l + lightness_to_scale * scale_factor;
    return d3.rgb(hsl_color);
}

function get_TT_average(){
    TT_min = 1;
    TT_max = 0;
    for(var i = 0; i < alldata.length; i++){
	var TT_ratio = alldata[i][15] / (alldata[i][10] + alldata[i][11]);
	if(TT_ratio < TT_min){
	    TT_min = TT_ratio;
	}else if(TT_ratio > TT_max){
	    TT_max = TT_ratio;
	}	
    }
    TT_average = (TT_min + TT_max) / 2;
}


// Use the global select date to reset the data
function set_data(){
    alldata = [];
    for(var i = 0; i < parsedData.length; i++){
	if(parsedData[i][1] == year_select){
	    alldata.push(parsedData[i]);
	}
    }
}