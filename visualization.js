//Design variables

//Width and height
var w = 850;
var h = 500;
var padding = 30;

//Size of datapoints
var radius_min = 100;
var radius_max = 700;

var color = d3.scale.category20();

// Selection groups, which identify their columns
var sel_indexes = [7, 8, 9, 20, 21, 22, 32, 31, 10, 11, 15]
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

// Quick Generate a Legend
legend = d3.select("#legend")
    .append("svg")
    .attr("width", 100)
    .attr("height", 115);
        
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

// Initialize all arrays
var alldata = new Array();

var x_median = 0;
var y_median = 0;
var x_mean = 0;
var y_mean = 0;

//Index of the denominator
var x_denom = 10;
var y_denom = 10;

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
var yData_label_numerator = '';
var yData_label_denominator = '';
var xAxis = 0;
var yAxis = 0;
var svg = 0;
var min = 0;
var max = 0;
var event = window.event;

//Create tooltip
tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");
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

xData = get_ratio_values(xind, x_denom);
yData = get_ratio_values(yind, y_denom);

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

// Draw Median Lines
xMedian = svg.append("svg:line")
    .attr("x1", xScale(x_median))
    .attr("y1", 0)
    .attr("x2", xScale(x_median))
    .attr("y2", h)
        .attr("class", "x-median")
    .style("stroke", "rgb(6,120,155)");

yMedian = svg.append("svg:line")
    .attr("x1", 0)
    .attr("y1", yScale(y_median))
    .attr("x2", w)
    .attr("y2", yScale(y_median))
        .attr("class", "y-median")
    .style("stroke", "rgb(6,120,155)");

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
        return color(departments[dep_ind][1]);
	})
    .style("stroke-width", ".5px")
    .on("mouseover", function(d,i){
         tooltip.text(alldata[i][0] + " || \n" + xData_label_numerator +": " + (alldata[i][xind]).toFixed(1) + "/" + xData_label_denominator +": " + (alldata[i][x_denom]).toFixed(1) + "\n" + yData_label_numerator +": " + (alldata[i][yind]).toFixed(1) + "/" + yData_label_denominator + ": " + (alldata[i][y_denom]).toFixed(1));
         return tooltip.style("visibility", "visible");})
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
        }else if(this.name == "yemp"){
                y_denom = sel_indexes[this.value];
                yData_label_denominator = sel_labels[this.value];
        }else if(this.name == "xemp"){
                x_denom = sel_indexes[this.value];
                xData_label_denominator = sel_labels[this.value];
        }

        xData = get_ratio_values(xind, x_denom);
        yData = get_ratio_values(yind, y_denom);

        //Resize range for plotting new values and each axis
        xScale.domain([0, d3.max(xData, function(d){
                return d[0];
        })])
         .range([padding, w - padding]);
        
        yScale.domain([0, d3.max(yData, function(d){
                return d[0];
        })])
         .range([h - padding, padding]);


var point = svg.selectAll(".point")
         .data(xData)
		 .transition()
		 .duration(500)
		.attr("transform", function(d,i) {
			x_val = xScale(d[0]);
			y_val = yScale(yData[i][0]);
			return "translate(" + x_val + "," + y_val + ")"; }
		);
        
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

        // Draw Median Lines
        xMedian = svg.select(".x-median")
                .transition()
                .duration(500)
                .attr("x1", xScale(x_median))
                .attr("y1", 0)
                .attr("x2", xScale(x_median))
                .attr("y2", h)
                .attr("class", "x-median")
                .style("stroke", "rgb(6,120,155)");

        yMedian = svg.select(".y-median")
                .transition()
                .duration(500)
                .attr("x1", 0)
                .attr("y1", yScale(y_median))
                .attr("x2", w)
                .attr("y2", yScale(y_median))
                .attr("class", "y-median")
                .style("stroke", "rgb(6,120,155)");

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

// Brandon - Modified to hit the lookup table instead of the value
function color_by_department(department){
		return color(departments[alldata[department][2]][1]);
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