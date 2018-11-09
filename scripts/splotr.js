$(document).on("keydown", function (e) {
  // if e.keycode == 36
  myevent = e;
  // console.log(e.keyCode);
  switch (e.keyCode) {
    case 8: // backspace
      console.log("backspace");
    case 46: { // delete
      console.log("delete");
    }
    case 36: {// home
      console.log("home");
      graph.reset_scale();
    }
  }
});


registerKeyboardHandler = function(callback) {
  console.log("keydown");
  var callback = callback;
  d3.select(window).on("keydown", callback);  
};


/**
 * Represent a plot object with x in linear scale and 
 * y in linear scale.
 * 
 * @constructor
 */
plotXlinYlin = function(elemid, options) {
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
  this.x = d3.scale.linear()
      .domain([this.options.xmin, this.options.xmax])
      .range([0, this.size.width]);

  // drag x-axis logic
  this.downx = Math.NaN;

  // y-scale (inverted domain)
  // inverted because height is second in the range
  this.y = d3.scale.linear()
      .domain([this.options.ymax, this.options.ymin])
      .nice()
      .range([0, this.size.height])
      .nice();

  // drag y-axis logic
  this.downy = Math.NaN;

  this.dragged = this.selected = null;

  this.logLine = d3.svg.line()
                  .x( function(d) { return this.x(d.f); } )  
                  .y( function(d) { return this.y(d.logMag); } );

  this.vis = d3.select(this.chart).append("svg")
      .attr("width",  this.cx)
      .attr("height", this.cy)
      .append("g")
        .attr("transform", "translate(" + this.padding.left + "," + this.padding.top + ")");

  this.color = d3.scale.category10();

  // this.color.domain(d3.keys(self.data[0]).filter(function(key) {
  //   return key !== "f" && key !== "number_of_ports";
  // }));
  
  this.params = this.color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {
          f: d.f,
          logMag: +d[name]
        };
      })
    };
  });

  this.param = this.vis.selectAll(".param")
    .data(this.params)
    .enter().append("g")
    .attr("class", "logMag");

  this.param.append("path")
    .attr("class", "line")
    .attr("d", function(d) {
      return this.logLine(d.values);
    })
    .style("stroke", function(d) {
      return this.color(d.name);
    });
 
  this.vis.append("text")
    .attr("class", "location-text")
    .attr("id", "locText")
    .attr("x", self.size.width - self.padding.left)
    .attr("y", self.size.height + self.padding.top)
    .text("x,y : ");

  this.plot = this.vis.append("rect")
      .attr("width", this.size.width)
      .attr("height", this.size.height)
      // .style("fill", "#EEEEEE")
      .style("fill", "#E6F7FF")
      .attr("pointer-events", "all")
      .on("mousemove", self.update_location())
      .on("mouseout", self.clear_location())
      .on("mousedown.drag", self.plot_drag())
      .on("touchstart.drag", self.plot_drag())
      this.plot.call(d3.behavior.zoom().x(this.x).y(this.y).on("zoom", this.redraw()));

  // d3.select("body")
  // // d3.select(this.plot)
  //     .on("keydown", function() { console.log("detected keydown")})

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
      // .append("path")
      //     .attr("class", "line")
      //     .attr("d", this.line(this.points));

  // create xAxis
  this.xAxis = d3.svg.axis()
                   .scale(this.x)
                   .orient("bottom")
                   .tickFormat( d3.format("s") )
                   .tickSize(-this.size.height);
                   // .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
                   // .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
                   // .on("mousedown.drag",  self.xaxis_drag())
                   // .on("touchstart.drag", self.xaxis_drag());

  this.vis.append("svg:g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + (this.size.height) + ")")
        .call(this.xAxis)
        .style("cursor", "ew-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.xaxis_drag())
        .on("touchstart.drag", self.xaxis_drag());
        // .on("mousedown", function(d) {
        //   console.log("mouseodwn on x axis");
        // });

  // create y axis
  this.yAxis = d3.svg.axis()
              .scale(this.y)
              .orient("left")
              .tickSize(-this.size.width)
              .ticks(6);

  // Add the y-axis to the left
  this.vis.append("svg:g")
        .attr("class", "y axis")
        .attr("id", "yAxis")
        .attr("transform", "translate(0,0)")
        .call(this.yAxis)
        .style("cursor", "ns-resize")
        .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
        .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
        .on("mousedown.drag",  self.yaxis_drag())
        .on("touchstart.drag", self.yaxis_drag());

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

  d3.select(this.chart)
    .on("mousemove.drag", self.mousemove())
    .on("touchmove.drag", self.mousemove())
    .on("mouseup.drag",   self.mouseup())
    .on("touchend.drag",  self.mouseup());
    // .on("keydown", function() { console.log("detected keydown")});

  // d3.select('body').call(d3.keybinding()
  //   .on("keydown", function() { console.log("detected keydown")}));

  
   this.redraw()();

};

plotXlinYlin.prototype = {
  
  /**
   * @desc plot data as lines on the chart
   * @param {Object} data_dict
   * @param {number} number_of_ports - number of ports  
   * @param {number[]} data_dict.f - array of frequencies in Hz 
   * @param {number[]} data_dict.s11db - dB value of s11 
   * @param {number[]} data_dict.s12db - dB value of s12 
   * @param {number[]} data_dict.s21db - dB value of s21 
   * @param {number[]} data_dict.s22db - dB value of s22 
   */
  plot_data: function(data_dict) {
    var self = this;
    self.parse_data_dict( data_dict );
    self.reset_scale();
    self.add_plot_lines();
    // self.update();

  },

   /** @description Resets the scale to account for the maximum and minimum
   * data values for all collective parameters
   * */
  reset_scale : function( ) {
    var self = this;
    if (self.data_dict != null) { 
      // self.parse_data_dict( data_dict );
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

    self.vis.select(".x.axis")
      .transition()
      .duration(500)
      .call(self.xAxis);

    self.vis.select(".y.axis")
      .transition()
      .duration(500)
      .call(self.yAxis);
  
    self.param.selectAll("path")
      .attr("class", "line")
      .transition()
      .duration(500)
      .attr("d", function(d) {
        return self.logLine(d.values);
      })
      .style("stroke", function(d) {
        return self.color(d.name);
      });

    
    self.redraw()();
  },

  /** @description adds a marker to the line with a vertical line as a mouse guide
   * in the x axis.
   */
  add_marker : function( ) {
    var self = this;
    return function(d) {
      my_param = self.param.select("#" + d.name + "-path");
    
      // find the index within self.param which is not null
      // this is the line that we want to add the marker
      // var i = my_param[0].findIndex( 
      var i = my_param[0].findIndex( 
        function(el) { 
          return (el !== null);
        }
      );
      line = my_param[0][i]; 

    //
    //  mouse line section
    //
      var mouseG = self.vis.append("g")
        .attr("class", "mouse-over-effects");


      mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

      var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(self.params)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");
      
      // self.param.select("#" + d.name + "-path").style("fill-opacity", "0.1");
      
      mousePerLine.append("circle")
        .attr("r", 5)
        .style("stroke", function(d) {
          return self.color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

      mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

      
      mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr("class", "overlay")
        .attr("id", d.name + "-markerOverlay")
        .attr("x", 0)
        .attr("y", 0)
        .attr('width', self.size.width) // can't catch mouse events on a g element
        .attr('height', self.size.height)
        // .on("click",  self.make_marker_static() )
        .on('click', function() { // on click, hide line, freeze marker and remove this rect
          console.log("freeze me");
          d3.select(".mouse-line")
            .style("opacity", "0");
          // d3.selectAll(".mouse-per-line circle")
          //   .style("opacity", "0");
          // d3.selectAll(".mouse-per-line text")
          //   .style("opacity", "0");
          d3.select("#" + d.name + "-markerOverlay").
            remove();
        })
        // .on("keydown", self.change_mode())
        .on('mouseout', function() { // on mouse out hide line, circles and text
          d3.select(".mouse-line")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "0");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
          console.log("mouseover within line");
          d3.select(".mouse-line")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line circle")
            .style("opacity", "1");
          d3.selectAll(".mouse-per-line text")
            .style("opacity", "1");
        })
        .on("mousemove", function(d) { self.move_marker()(this) });
        // .on('mousemove', function() { // mouse moving over canvas
        //   mouse = d3.mouse(this);
        //   mythis = this;
        //   d3.select(".mouse-line")
        //     .attr("d", function() {
        //       var d = "M" + mouse[0] + "," + self.size.height;
        //       d += " " + mouse[0] + "," + 0;
        //       return d;
        //     });

        //   d3.selectAll(".mouse-per-line")
        //     .attr("transform", function(d, i) {
        //       var xFreq = self.x.invert(mouse[0]),
        //           bisect = d3.bisector(function(d) { return d.f; }).right;
        //           idx = bisect(d.values, xFreq);

        //       var beginning = 0,
        //           // end = self.lines[i][0].getTotalLength(), // adds to all lines
        //           end = line.getTotalLength(),
        //           target = null;
        //     
        //       while (true){
        //         target = Math.floor((beginning + end) / 2);
        //         // pos = self.lines[i][0].getPointAtLength(target); // adds to all lines
        //         pos = line.getPointAtLength(target);
        //         if ((target === end || target === beginning) && pos.x !== mouse[0]) {
        //             break;
        //         }
        //         if (pos.x > mouse[0])      end = target;
        //         else if (pos.x < mouse[0]) beginning = target;
        //         else break; //position found
        //       }

        //       d3.select(this).select('text')
        //         // .text(self.y.invert(pos.y).toFixed(2));
        //         .text(d3.format(".3s")(self.x.invert(pos.x)) + "," + self.y.invert(pos.y).toFixed(2));

        //       return "translate(" + mouse[0] + "," + pos.y +")";
        //   });
        
        // });
      }
  },

  /** @description move the marker to the current location of the mouse
   * @param {d3.rect} mythis - rectangle for catching mouse movements
   */
  move_marker : function ( ) {
    var self = this;
    return function( mythis ) {
      var mouse = d3.mouse(mythis);
      d3.select(".mouse-line")
        .attr("d", function() {
          var d = "M" + mouse[0] + "," + self.size.height;
          d += " " + mouse[0] + "," + 0;
          return d;
        });

      d3.selectAll(".mouse-per-line")
        .attr("transform", function(d, i) {
          var xFreq = self.x.invert(mouse[0]),
              bisect = d3.bisector(function(d) { return d.f; }).right;
              idx = bisect(d.values, xFreq);

          var beginning = 0,
              // end = self.lines[i][0].getTotalLength(), // adds to all lines
              end = line.getTotalLength(),
              target = null;
        
          while (true){
            target = Math.floor((beginning + end) / 2);
            // pos = self.lines[i][0].getPointAtLength(target); // adds to all lines
            pos = line.getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
            }
            if (pos.x > mouse[0])      end = target;
            else if (pos.x < mouse[0]) beginning = target;
            else break; //position found
          }

          d3.select(this).select('text')
            // .text(self.y.invert(pos.y).toFixed(2));
            .text(d3.format(".3s")(self.x.invert(pos.x)) + "," + self.y.invert(pos.y).toFixed(2));

          return "translate(" + mouse[0] + "," + pos.y +")";
      });
    }
  },

  toggle_trace : function( ) {
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
  }

};

// /** @description detect a keydown while in the graph area and take appropriate action 
//  * CURRENTLY THIS FUNCTION DOESN'T SEEM TO DETECT KEY PRESSES
// */
// plotXlinYlin.prototype.keydown = function() {
//   var self = this;
//   return function() {
//     if (!self.selected) return;
//     switch (d3.event.keyCode) {
//       case 8: {// backspace
//         console.log("backspace");
//       }
//       case 46: { // delete
//         console.log("delete");
//       }
//        case 36: {// home
//          // console.log("home");
//          self.reset_scale();
//        }
//         // var i = self.points.indexOf(self.selected);
//         // self.points.splice(i, 1);
//         // self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
//         // self.update();
//         // break;
//     }
//   }
// };

plotXlinYlin.prototype.plot_drag = function() {
  var self = this;
  console.log("drag()");

  return function() {
    registerKeyboardHandler(self.keydown());
    d3.select('body').style("cursor", "move");
  
    if (d3.event.altKey) {
      console.log("you pressed the alt key");
    //   var p = d3.svg.mouse(self.vis.node());
    //   var newpoint = {};
    //   newpoint.x = self.x.invert(Math.max(0, Math.min(self.size.width,  p[0])));
    //   newpoint.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
    //   self.points.push(newpoint);
    //   self.points.sort(function(a, b) {
    //     if (a.x < b.x) { return -1 };
    //     if (a.x > b.x) { return  1 };
    //     return 0
    //   });
    //   self.selected = newpoint;
    //   self.update();
    //   d3.event.preventDefault();
    //   d3.event.stopPropagation();
    }    
  }
};

plotXlinYlin.prototype.clear_location = function() {
  var self = this;
  return function() {
    self.vis.select("#locText")
      .text("x,y : " );
  }
};


plotXlinYlin.prototype.update_location = function() {
  var self = this;
  return function() {
    // console.log(d3.svg.mouse(self.vis[0][0]));
    var p = d3.svg.mouse(self.vis[0][0]);
    var y = d3.format(".4f")(self.y.invert(p[1]));
    var x = d3.format(".4s")(self.x.invert(p[0]));
    // console.log(d3.select(this)); 
    self.vis.select("#locText")
      .text("x,y : " + String(x) +" , " + String(y) );
    // d3.select(this)
    //   .text("x,y : " + String(p[0]) +" , " + String(p[1]) );
  }
};


plotXlinYlin.prototype.redraw = function() {
  var self = this;
  return function() {
    // var tx = function(d) { 
    //   return "translate(" + self.x(d) + ",0)"; 
    // },
    // ty = function(d) { 
    //   return "translate(0," + self.y(d) + ")";
    // },
    // stroke = function(d) { 
    //   return d ? "#ccc" : "#666"; 
    // },
    // fx = self.x.tickFormat(10),
    // fy = self.y.tickFormat(10);

    // console.log('in the function'); 
    //
    self.vis.select(".x.axis").call(self.xAxis);
    self.vis.select(".y.axis").call(self.yAxis);

    // self.param.selectAll("path")
    //   .attr("class", "line")
    //   .attr("d", function(d) {
    //     return self.logLine(d.values);
    //   })
    //   .style("stroke", function(d) {
    //     return self.color(d.name);
    //   })
    //     .attr("clip-path", "url(#rect-clip)");
    
    // var gx = self.vis.selectAll("g.x")
    //     .data(self.x.ticks(10), String)
    //     .attr("transform", tx);

    // gx.select("text")
    //     .text(fx);

    // var gxe = gx.enter().insert("g", "a")
    //     .attr("class", "x")
    //     .attr("transform", tx);

    // gxe.append("line")
    //     .attr("stroke", stroke)
    //     .attr("y1", 0)
    //     .attr("y2", self.size.height);

    // gxe.append("text")
    //     .attr("class", "axis")
    //     .attr("y", self.size.height)
    //     .attr("dy", "1em")
    //     .attr("text-anchor", "middle")
    //     .text(fx)
    //     .style("cursor", "ew-resize")
    //     .on("mouseover", function(d) { d3.select(this).style("font-weight", "bold");})
    //     .on("mouseout",  function(d) { d3.select(this).style("font-weight", "normal");})
    //     .on("mousedown.drag",  self.xaxis_drag())
    //     .on("touchstart.drag", self.xaxis_drag());
     
    self.plot.call(d3.behavior.zoom().x(self.x).y(self.y).on("zoom", self.redraw()));
    self.update();    
  }  
}


/**
 * @desc plot data as lines on the chart
 * @param {Object} data_dict
 * @param {number} number_of_ports - number of ports  
 * @param {number[]} data_dict.f - array of frequencies in Hz 
 * @param {number[]} data_dict.s11db - dB value of s11 
 * @param {number[]} data_dict.s12db - dB value of s12 
 * @param {number[]} data_dict.s21db - dB value of s21 
 * @param {number[]} data_dict.s22db - dB value of s22 
 */

// plotXlinYlin.prototype.update = function() {
//   var self = this;
//   // var lines = this.vis.select("path").attr("d", this.line(this.points));
//         
//   // var circle = this.vis.select("svg").selectAll("circle")
//   //     .data(this.points, function(d) { return d; });
// 
//   // circle.enter().append("circle")
//   //     .attr("class", function(d) { return d === self.selected ? "selected" : null; })
//   //     .attr("cx",    function(d) { return self.x(d.x); })
//   //     .attr("cy",    function(d) { return self.y(d.y); })
//   //     .attr("r", 10.0)
//   //     .style("cursor", "ns-resize")
//   //     .on("mousedown.drag",  self.datapoint_drag())
//   //     .on("touchstart.drag", self.datapoint_drag());
// 
//   // circle
//   //     .attr("class", function(d) { return d === self.selected ? "selected" : null; })
//   //     .attr("cx",    function(d) { 
//   //       return self.x(d.x); })
//   //     .attr("cy",    function(d) { return self.y(d.y); });
// 
//   // circle.exit().remove();
// 
// };


/**
 * @desc parse the data dict to the correct format. Convert the
 * data_dict, which is an Object with properties that are arrays of 
 * values, to a list of Objects, where each item in the list 
 * is a 
 * @param {Object} data_dict
 * @param {number} number_of_ports - number of ports  
 * @param {number[]} data_dict.f - array of frequencies in Hz 
 * @param {number[]} data_dict.s11db - dB value of s11 
 * @param {number[]} data_dict.s12db - dB value of s12 
 * @param {number[]} data_dict.s21db - dB value of s21 
 * @param {number[]} data_dict.s22db - dB value of s22 
 * 
 * converts the obove object to 
 * 
 * @param {Object[]} - self.data
 * @param {number} number_of_ports - number of ports  
 * @param {number} f - frequency in Hz
 * @param {number} s11db - dB value of s11 at f
 * @param {number} s12db - dB value of s12 at f 
 * @param {number} s21db - dB value of s21 at f 
 * @param {number} s22db - dB value of s22 at f 
 */
plotXlinYlin.prototype.parse_data_dict = function( data_dict ) {

  var self = this;
  self.data_dict = data_dict;
  self.data = [];
  for ( i=0; i<=data_dict.f.length-1; i++ ) {
    var temp_dict = { };
    for (var propt in data_dict) {
      temp_dict[propt] = data_dict[propt][i];
    } 
   self.data.push( temp_dict); 
  };
};




plotXlinYlin.prototype.update = function() {
  // console.log("update");
  var self = this;
  
  self.param.selectAll("path")
    .attr("class", "line")
    .attr("d", function(d) {
      return self.logLine(d.values);
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


/**
 * @desc add legend to plot
 */
plotXlinYlin.prototype.add_plot_lines = function( ) {

  var self = this;

  self.color.domain(d3.keys(self.data[0]).filter(function(key) {
    return key !== "f" && key !== "number_of_ports";
  }));
  
  // self.params is an array of Objects which is the data passed to self.param
  //    Each object within has the following self.param is a data map
  //          f is th frequency in Hz
  //          logMag is the magnitude in dB
  //  
  self.params = self.color.domain().map(function(name) {
    return {
      name: name,
      values: self.data.map(function(d) {
        return {
          f: d.f,
          logMag: +d[name]
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
    .on("click", function(d) { self.add_marker()(d); } )
    .on("mouseover", function(d) { d3.select(this).style("stroke-width", "5px");})
    .on("mouseout", function(d) { d3.select(this).style("stroke-width", "3px");})
    .attr("d", function(d) {
      return self.logLine(d.values);
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
  
    self.lines = graph.param.selectAll("path");


};

plotXlinYlin.prototype.make_marker_static = function() {
  var self = this;
  return function() {
    // document.onselectstart = function() { return false; };
    // active = self.param.select("#" + d.name + "-path").attr("active");
    // console.log(d3.event.keyCode);
    console.log("you clicked after adding marker");
    mything = d3.select(this);
    d3.select(this).attr("pointer-events", "none");
    // mything = d3.select("mouse-over-effects");
    // d3.select(mything).attr("pointer-events", "none");
    d3.select(this).attr("pointer-events", "none");

    // if (!self.selected) return;
    // switch (d3.event.keyCode) {
    //   case 8: // backspace
    //   case 46: { // delete
    //     // var i = self.points.indexOf(self.selected);
    //     // self.points.splice(i, 1);
    //     // self.selected = self.points.length ? self.points[i > 0 ? i - 1 : 0] : null;
    //     // self.update();
    //     // break;
    //   }
    // }


  };
};



plotXlinYlin.prototype.change_mode = function() {
  var self = this;
  console.log("change_mode");
  return function() {
    console.log("change_mode");
    registerKeyboardHandler(self.keydown());
    console.log(d3.event.keyCode);
    // switch (d3.event.keyCode) {
    //   case 8: // backspace
    //   case 46: { // delete
  }
};

plotXlinYlin.prototype.mousemove = function() {
  var self = this;
  return function() {
    console.log("mousemove");
    var p = d3.svg.mouse(self.vis[0][0]),
        t = d3.event.changedTouches;
    
    if (self.dragged) {
      self.dragged.y = self.y.invert(Math.max(0, Math.min(self.size.height, p[1])));
      self.update();
    };
    if (!isNaN(self.downx)) {
      d3.select('body').style("cursor", "ew-resize");
      var rupx = p[0],
			  // get the limits of the data
			  // xaxis1 = self.x.invert(self.x.domain()[0]),
			  xaxis1 = self.x.domain()[0],
			  xaxis2 = self.x.domain()[1],
			  changex, new_xdomain, newxmax, delta_x;
      
      changex = ( self.downx ) / ( Math.max(1, rupx));
      newxmax = xaxis1 + (self.xextent * changex);
      
      // apply the changes
      new_xdomain =  [xaxis1, newxmax];
      self.x.domain(new_xdomain);
      self.redraw()();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      d3.select('body').style("cursor", "ns-resize");
      // get the relative mouse y coordinate
      var rupy = p[1],
          // get the limits of the axis
          yaxis1 = self.y.domain()[1],
          yaxis2 = self.y.domain()[0],
          changey, new_domain, newymax;

      // base the change on the mouse position change, relative
      // to the height of the plot
      changey = ( self.size.height - self.downy) / ( Math.max( 1, self.size.height - rupy ) );
        
      // calculate the new max based on:
      // the original range * the proportional mouse movement
      newymax = yaxis1 + (self.yextent * changey);

      // apply the changes
      new_domain = [newymax, yaxis1];
      self.y.domain(new_domain);
      self.redraw()();
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
  }
};

plotXlinYlin.prototype.xaxis_drag = function() {
  var self = this;
  return function(d) {
    // set this flag
    document.onselectstart = function() { return false; };
		
    // get the relative positin in pixels 
    self.downx = d3.svg.mouse(self.vis[0][0])[0];
	  
    // make note of the range at the time of initiating the drag	
		self.xextent = self.x.domain()[1] - self.x.domain()[0];	
   	
  }
};

plotXlinYlin.prototype.yaxis_drag = function(d) {
  var self = this;
  return function(d) {
    // set this flag
    document.onselectstart = function() { return false; };
    
    // get the relative mouse position in pixels
    self.downy = d3.svg.mouse(self.vis[0][0])[1];
    
    // make a note of the range at the time of initiating the drag
    self.yextent = self.y.domain()[0] - self.y.domain()[1];
  }
};
//   return function(d) {
//     // console.log("yaxis_drag");
//     document.onselectstart = function() { return false; };
//     var p = d3.svg.mouse(self.vis[0][0]);
//     console.log("p[1] = " + String(p[1]));
//     // self.downy = self.y.invert(p[1]) - self.y.domain()[1];
//     self.downy = self.y.invert(p[1]);
//     console.log("self.downy = " + String(self.downy));
//   }
// };


/** @description detect a mouseup event and take appropriate action
 */
plotXlinYlin.prototype.mouseup = function() {
  var self = this;
  return function() {
    console.log("mouseup");
    document.onselectstart = function() { return true; };
    d3.select('body').style("cursor", "auto");
    d3.select('body').style("cursor", "auto");
    if (!isNaN(self.downx)) {
      self.redraw()();
      self.downx = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    };
    if (!isNaN(self.downy)) {
      self.redraw()();
      self.downy = Math.NaN;
      d3.event.preventDefault();
      d3.event.stopPropagation();
    }
    if (self.dragged) { 
      self.dragged = null 
    }
  }
};


function test_ajax() {
  my_url = "/splotr/test_ajax?"
  dat = "";
  $.ajax( {
            type: "GET",
            url: my_url,
            datatype: 'json',
            async: true,
            data: dat,
            success: function (data) {
                dat = data;
                console.log(data);
                // graph.plot_data(data);
                // // plotLogMag( data_dict=data );
                // document.getElementById("plotBtn").disabled = true;
            },
            error: function (result) {
            }
  });
  // console.log("plot();");
}

/** @description send the file data and filename to the lambda function. If successfuly receive
 * json data from the lambda, call plotXlinYlin.plot_data
 * 
 */
function plot() {
  var fid = document.getElementById("files");
  var fname = fid.files[0].name;
  var txt = document.getElementById("file_data");
  var fdata = txt.value;

  var dat_json = {
                  "filedata": fdata,
                  "filename": fname
  };

  $.ajax( {
            type: "POST",
            url: "https://glxl3qdmrk.execute-api.us-east-2.amazonaws.com/dev/getLogMag", // to deploy
            // url: "http://127.0.0.1:3000/getLogMag", // for testing
            datatype: 'json',
            async: true,
            data: JSON.stringify(dat_json),
            crossDomain: true,
            success: function (data) {
              dat = data;
              document.getElementById("plotBtn").disabled = true;
              graph.plot_data(data);
            },
            error: function (result) {
            }
  });
};


/* Handles the dropping file on chart
 */
function drop_handler(ev) {
  console.lod("drop");
  ev.preventDefault();
  ev.stopPropagation();
  // if dropped items aren't file, reject them
  // var dt = ev.dataTranser();
  // if (dt.items) {
  //   // use DataTransferItemList to access the file(s)
  //   for (var i=0; dt.items.length; i++) {
  //     if (dt.items[i].kind == "file") {
  //       var f = dt.items[i].getAsFile();
  //       console.log("... file[" + i + "].name = " + f.name );
  //     }
  //   }
  // } else {
  //   for (var i=0; dt.items.length; i++) {
  //   console.log("... file[" + i + "].name = " + f.name );
  //   }
  // }
};


function dragover_handler(ev) {
  console.log("dragOver");
  ev.preventDefault();
};


function dragend_handler(ev) {
  console.log("dragEnd");
  // Remove all of the drag data
  var dt = ev.dataTransfer;
  if (dt.items) {
    // use DataTransferItemList interface to remove the drag data
    for (var i = 0; i < dt.items.length; i++) {
      dt.items.remove(i);
    }
  } else {
    // use DataTransfer interface to remove the drag data
    ev.dataTransfer.clearData();
  }
};





