
SemilogXPlot = function(elemid, options) {
    var self = this;
    this.chart = document.getElementById(elemid);
    this.cx = this.chart.clientWidth;
    this.cy = this.chart.clientHeight;
    this.options = options || {};
    this.options.xmax = options.xmax || 6e9;
    this.options.xmin = options.xmin || 0;
    this.options.ymax = options.ymax || 20;
    this.options.ymin = options.ymin || -50;

    this.padding = {
       "top":    this.options.title  ? 50 : 20,
       "right":                100,
       "bottom": this.options.xlabel ? 60 : 10,
       "left":   this.options.ylabel ? 70 : 45
    };

    this.size = {
      "width":  this.cx - this.padding.left - this.padding.right,
      "height": this.cy - this.padding.top  - this.padding.bottom
    };

    // x-scale
    this.x = d3.scale.log()
        .domain([this.options.xmin, this.options.xmax])
        .range([0, this.size.width]);

    // y-scale (inverted domain)
    // inverted because height is second in the range
    this.y = d3.scale.linear()
        .domain([this.options.ymax, this.options.ymin])
        .nice()
        .range([0, this.size.height])
        .nice();

    this.dataline = d3.svg.line()
                    .x( function(d) { return this.x(d.f); } )  
                    .y( function(d) { return this.y(d.db); } );

      // create xAxis


    this.vis = d3.select(this.chart).append("svg")
        .attr("width",  this.cx)
        .attr("height", this.cy)
        .append("g")
          .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

    this.color = d3.scale.category10();
  

    this.plot = this.vis.append("rect")
        .attr("width", this.size.width)
        .attr("height", this.size.height)
        .style("fill", "#E6F7FF");

    this.vis.append("clipPath")
           .attr("id","rect-clip")
           .append("rect")
           .attr("width",this.size.width)
           .attr("height",this.size.height);

    this.vis.append("svg")
        .attr("top", 0)
        .attr("left", 0)
        .attr("width", this.size.width)
        .attr("height", this.size.height)
        .attr("viewBox", "0 0 "+this.size.width+" "+this.size.height)
        .attr("class", "line");

    // create xAxes
    this.xAxisMinor = d3.svg.axis()
                          .scale(this.x)
                          .orient("bottom")
                          .tickFormat( "" )
                          .tickSize(-this.size.height);

    this.xAxisMajor = d3.svg.axis()
                            .scale(this.x)
                            .orient("bottom")
                            .tickValues([10,100,1000,10e3,100e3,1e6,10e6,100e6,1e9])
                            .tickFormat( d3.format("s") )
                            .tickSize(-this.size.height);


    this.vis.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          .attr("transform", "translate(0," + (this.size.height) + ")")
          .call(this.xAxisMajor)
          .style("cursor", "ew-resize");

    this.vis.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          .attr("transform", "translate(0," + (this.size.height) + ")")
          .call(this.xAxisMinor);

    // create yAxis 
    this.yAxis = d3.svg.axis()
                       .scale(this.y)
                       .orient("left")
                       .tickSize(-this.size.width)
                       .ticks(9);
    // // create y axis
    // this.yAxis = d3.svg.axis()
    //             .scale(this.y)
    //             .orient("left")
    //             .tickSize(-this.size.width)
    //             .ticks(6);

    // Add the y-axis to the left
    this.vis.append("svg:g")
          .attr("class", "y axis")
          .attr("id", "yAxis")
          .attr("transform", "translate(0,0)")
          .call(this.yAxis)
          .style("cursor", "ns-resize");

    // add Chart Title
    if (this.options.title) {
      this.vis.append("text")
          .attr("class", "chart-title")
          .text(this.options.title)
          .attr("x", this.size.width/2)
          .attr("dy","-0.8em")
          .style("text-anchor","middle")
          .on("dblclick", function(d) {
            console.log("you clicked the title");
          });
    }

    // Add the x-axis label
    if (this.options.xlabel) {
      this.vis.append("text")
          .attr("class", "axis")
          .text(this.options.xlabel)
          .attr("x", this.size.width/2)
          .attr("y", this.size.height)
          .attr("dy","2.4em")
          .style("text-anchor","middle")
    }

    // add y-axis label
    if (this.options.ylabel) {
      this.vis.append("g").append("text")
          .attr("class", "axis")
          .text(this.options.ylabel)
          .style("text-anchor","middle")
          .attr("transform","translate(" + -40 + " " + this.size.height/2+") rotate(-90)");
    }

    };
