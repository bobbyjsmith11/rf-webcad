
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
  
    this.params = this.color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {
            f: d.f,
            db: +d[name]
          };
        })
      };
    });

    this.param = this.vis.selectAll(".param")
      .data(this.params)
      .enter().append("g")
      .attr("class", "db");

    this.param.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return this.dataline(d.values);
      })
      .style("stroke", function(d) {
        return this.color(d.name);
      });


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
    this.xAxisMajor = d3.svg.axis()
                            .scale(this.x)
                            .orient("bottom")
                            .tickValues([10,100,1000,10e3,100e3,1e6,10e6,100e6,1e9])
                            .tickFormat( d3.format("s") )
                            .tickSize(-this.size.height);


    this.xAxisMinor = d3.svg.axis()
                          .scale(this.x)
                          .orient("bottom")
                          .tickFormat("")
                          .tickSize(-this.size.height);



    this.vis.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMinor")
          .attr("transform", "translate(0," + (this.size.height) + ")")
          .call(this.xAxisMinor);

    this.vis.append("svg:g")
          .attr("class", "x axis")
          .attr("id", "xAxisMajor")
          .attr("transform", "translate(0," + (this.size.height) + ")")
          .call(this.xAxisMajor)
          .style("cursor", "ew-resize");


    // create yAxis 
    this.yAxis = d3.svg.axis()
                       .scale(this.y)
                       .orient("left")
                       .tickSize(-this.size.width)
                       .ticks(9);

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

function test() {
    data_dict = {};
    data_dict['f'] = [10,100,1e3,10e3,100e3,1e6,10e6,100e6];
    data_dict['ref'] = [-50,-70,-90,-110,-130,-140,-145,-150];
    data_dict['vco'] = [-30,-50,-70,-90,-110,-130,-140,-140];
    graph.parse_data_dict(data_dict);  
    graph.reset_scale();
    graph.add_plot_lines();
    graph.update();
    // my_parsed_dat = [];
    // for ( i=0; i<=data_dict.f.length-1; i++ ) {
    //   console.log(data_dict['f'[i]]);
    //   var temp_dict = { };
    //   for (var propt in data_dict) {
    //     temp_dict[propt] = data_dict[propt][i];
    //   } 
    // my_parsed_dat.push(temp_dict);
};

function test_update() {
    data_dict = {};
    data_dict['f'] = [10,100,1e3,10e3,100e3,1e6,10e6,100e6];
    data_dict['ref'] = [-90,-90,-90,-110,-130,-140,-145,-150];
    data_dict['vco'] = [-30,-50,-70,-90,-110,-130,-150,-160];
    graph.parse_data_dict(data_dict);  
    graph.reset_scale();
    graph.update();

};

function test_clear() {
  graph.clear_plot();
}

SemilogXPlot.prototype.parse_data_dict = function( data_dict ) {

  var self = this;
  self.data_dict = data_dict;
  self.data = [];
  for ( i=0; i<=data_dict.f.length-1; i++ ) {
    var temp_dict = { };
    for (var propt in data_dict) {
      temp_dict[propt] = data_dict[propt][i];
    } 
   self.data.push(temp_dict); 
  };
};


SemilogXPlot.prototype.plot_data = function( data_dict ) {

  console.log("plot_data");
  var self = this;
  self.parse_data_dict( data_dict );
  // self.reset_scale( data_dict=data_dict );
  self.reset_scale();
  self.add_plot_lines();
  self.update();

};


SemilogXPlot.prototype.reset_scale = function( ) {
  var self = this;
  if (self.data_dict != null) { 
    // console.log('data_dict != null');
    self.parse_data_dict( data_dict );
    var fstart = self.data[0].f;
    var fstop = self.data[self.data.length - 1].f;
    
    var max_ar = [];
    var min_ar = [];

    for (var propt in self.data[0]) {
      if (propt != "f" && propt != "number_of_ports"){
        max_ar.push( math.max.apply(math,self.data.map( function(o){return o[propt]})) );
        min_ar.push( math.min.apply(math,self.data.map( function(o){return o[propt]})) );
      };
    };

    var max_y = math.max(max_ar);
    var min_y = math.min(min_ar);
    max_y = math.ceil(max_y/10)*10;
    min_y = math.floor(min_y/10)*10;
  } else {
    // console.log("data_dict = null");
    var fstart = self.options.xmin
    var fstop = self.options.xmax
    var min_y = self.options.ymin
    var max_y = self.options.ymax
  };

  // remember, the y scale is inverted, so max_y comes before min_y 
  self.y.domain([max_y,min_y]);
  
  self.x.domain([fstart, fstop]);

  self.vis.select("#xAxisMajor")
    .transition()
    .duration(500)
    .call(self.xAxisMajor);
   
  self.vis.select("#xAxisMinor")
    .transition()
    .duration(500)
    .call(self.xAxisMinor);
  
  self.vis.select("#yAxis")
    .transition()
    .duration(500)
    .call(self.yAxis);
  
  // self.redraw()();
};

SemilogXPlot.prototype.clear_plot = function() {
  var self = this;
  
  // self.param = this.vis.selectAll(".param")
  //   .data(self.params)
  //   .enter().append("g")
  //   .attr("class", "logMag");

  self.param.select("path").remove();
  self.param.select("rect").remove();
  self.param.select("text").remove();

}

SemilogXPlot.prototype.add_plot_lines = function( ) {
  var self = this;

  self.color.domain(d3.keys(self.data[0]).filter(function(key) {
    return key !== "f" && key !== "number_of_ports";
  }));
 
  // self.params.enter().data(self.data);

  self.params = self.color.domain().map(function(name) {
    return {
      name: name,
      values: self.data.map(function(d) {
        return {
          f: d.f,
          db: +d[name]
        };
      })
    };
    });

  self.param = this.vis.selectAll(".param")
    .data(self.params)
    .enter().append("g")
    .attr("class", "logMag");

  self.param.append("path")
    .attr("id", function(d) { return d.name + "-path"; })
    .attr("active", true)
    .attr("class", "data-line")
    // .on("click", function(d) { self.add_marker()(d); } )
    .on("mouseover", function(d) { d3.select(this).style("stroke-width", "5px");})
    .on("mouseout", function(d) { d3.select(this).style("stroke-width", "3px");})
    .attr("d", function(d) {
      return self.dataline(d.values);
    })
    .style("stroke", function(d) {
      return self.color(d.name);
    })
   .style("stroke-width", "3px");
    
  self.param.append('rect')
    .attr("id", function(d) { return d.name + "-rect"; })
    .attr("active", true)
    .attr('x', self.size.width + 5)
    .attr('y', function(d, i) {
      return i * 20 ;
    })
    .attr('width', 10)
    .attr('height', 10)
    .attr("active", true)
    .style('fill', function(d) {
      return self.color(d.name);
    })
    .on("mouseover", function(d) { d3.select(this).attr("width", 12).attr("height",12);})
    .on("mouseout", function(d) { d3.select(this).attr("width", 10).attr("height",10);})
    .on("click", function(d) { self.toggle_trace()(d) });

  self.param.append("text")
    .attr("id", function(d) { return d.name + "-text"; })
    .attr('x', self.size.width + 20)
    .attr('y', function(d, i) {
      return (i * 20) + 9;
    })
    .text(function(d) {
      return d.name;
    });

};

SemilogXPlot.prototype.redraw = function() {
  var self = this;
  return function() {
    self.vis.select(".x.axis").call(self.xAxisMajor);
    self.vis.select(".x.axis").call(self.xAxisMinor);
    self.vis.select(".y.axis").call(self.yAxis);
     
    self.plot.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
    self.update();    
  }  
};

SemilogXPlot.prototype.update = function() {
  // console.log("update");
  var self = this;
  
  self.param.selectAll("path")
    .attr("class", "line")
    .transition()
    .duration(500)
    .attr("d", function(d) {
      return self.dataline(d.values);
    })
    .style("stroke", function(d) {
      return self.color(d.name);
    })
      .attr("clip-path", "url(#rect-clip)");

  if (d3.event && d3.event.keyCode) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
  }

};

SemilogXPlot.prototype.toggle_trace = function( ) {
  var self = this;
  return function( d ) {
    document.onselectstart = function() { return false; };
    var active = self.param.select("#" + d.name + "-path").attr("active");
    if (active == "true") {
      active = false
      self.param.select("#" + d.name + "-rect").style("fill-opacity", "0.1");
      self.param.select("#" + d.name + "-text").style("fill-opacity", "0.5");
      self.param.select("#" + d.name + "-path").style("opacity", "0");
    } else {
      self.param.select("#" + d.name + "-rect").style("fill-opacity", "1");
      self.param.select("#" + d.name + "-text").style("fill-opacity", "5");
      self.param.select("#" + d.name + "-path").style("opacity", "1");
      active = true 
    }
    self.param.select("#" + d.name + "-path").attr("active", active);
  };
};