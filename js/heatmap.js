 var color_limits = [0.2, 0.8,  1.3,  3.0];
  var default_color = "#dcdcdc"
  var colors = ["#009d0c","#fbe297","#de6361",];

  function getCellColor(colors, color_limits, chart_ratio){
    // make sure it's in range
    chart_ratio = Math.min(chart_ratio, color_limits[3]);
    chart_ratio = Math.max(chart_ratio, color_limits[0]);
    var color;
    if (chart_ratio > color_limits[1] && chart_ratio < color_limits[2]) {
      color = colors[1];
    }else if (chart_ratio >= color_limits[2]) {
      // lighten red color as it gets closer to lower bounds, but make sure it
      color = colors[2] * ( (chart_ratio - color_limits[2]) / (color_limits[3] - color_limits[2]) * 0.7) + 0.3;
      color = colors[2];
    }else if (chart_ratio <= color_limits[1]) {
      // darken green color as it gets closer to lower bounds
      color = colors[0];
    }
    return color;
  }

  function getCellOpacity(colors, color_limits, chart_ratio){
    // make sure it's in range
    chart_ratio = Math.min(chart_ratio, color_limits[3]);
    chart_ratio = Math.max(chart_ratio, color_limits[0]);
    if (chart_ratio > color_limits[1] && chart_ratio < color_limits[2]) {
      return 1;
    }else if (chart_ratio >= color_limits[2]) {
      // lighten red color as it gets closer to lower bounds, but make sure it
      return (chart_ratio - color_limits[2]) / (color_limits[3] - color_limits[2]) * 0.6 + 0.4;
    }else if (chart_ratio <= color_limits[1]) {
      // darken green color as it gets closer to lower bounds
      return (color_limits[1] - chart_ratio) * 0.4 + 0.6;
    }
  }


  var category_arr = [];

  function getInd(str){
     var i;
     for(i = 0; i < category_arr.length; i++){
      if(category_arr[i] == str) return i;
     }
     return -1;
  }


  var margin = { top: 50, right: 0, bottom: 100, left: 30 },
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      buckets = 9;

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var heatmapChart = function(csvFile) {
    d3.csv(csvFile, function(error, data) {
      d3.csv('data/category_relval.csv',function(error,category_dt){
          var i, length = category_dt.length;
          var gridWidth = Math.floor(width / (length+3));
          var gridHeight = Math.floor(height / (length+2));
          var color_arr = [];
          var opacity_arr = [];
          var card_ratio_arr = [];
          var chart_ratio_arr = [];
          var avg_ratio_arr = [];
          var startY = gridHeight/2*3;

          svg.append("text")
            .text("TO GRADE")
            .attr("x",(length+2) * gridWidth)
            .attr("y",startY+length/2*gridHeight)
            .style("font-size",(gridHeight/2)+"px")
            .attr("dy","-0.5em")
            .attr("text-anchor",'middle')
            .call(wrap,2);

          svg.append("text")
            .text("FROM GRADE")
            .attr("x",length/2 * gridWidth)
            .attr("y",0)
            .attr('text-anchor','middle')
            .style("font-size",(gridHeight/2)+"px");
          for(i = 0 ; i < length; i++){

            var text = category_dt[i].category;

            category_arr.push(text);

            svg.append("text")
              .text(text)
              .attr("x",length * gridWidth + gridHeight/2)
              .attr("y",startY+i*gridHeight + gridHeight/3*2)
              .style("font-size",(gridHeight/3)+"px");

            svg.append("text")
              .text(text)
              .attr("x",i*gridWidth + gridWidth/2)
              .attr("text-anchor","middle")
              .attr("y",startY/3*2)
              .style("font-size",(gridHeight/3)+"px");
          }

          for(j = 0; j < length; j++){
            var tmp = [];
            for(i = 0; i < length; i++){
              tmp.push(default_color);
            }
            color_arr.push(tmp);
            tmp = [];
            for(i = 0; i < length; i++){
              tmp.push(-1);
            }
            card_ratio_arr.push(tmp);
            tmp = [];
            for(i = 0; i < length; i++){
              tmp.push(-1);
            }
            avg_ratio_arr.push(tmp);
            tmp = [];
            for(i = 0; i < length; i++){
              tmp.push(-1);
            }
            chart_ratio_arr.push(tmp);
            tmp = [];
            for(i = 0; i < length; i++){
              tmp.push(1);
            }
            opacity_arr.push(tmp);
          }
          for(i = 0; i < data.length; i++){
            var m = getInd(data[i].to);
            var k = getInd(data[i].from);
            color_arr[m][k] = getCellColor(colors,color_limits,data[i].chart_ratio);
            opacity_arr[m][k] = getCellOpacity(colors,color_limits,data[i].chart_ratio);
            chart_ratio_arr[m][k] = parseFloat(data[i].chart_ratio);
            card_ratio_arr[m][k] = (Math.round(parseFloat(data[i].card_ratio)*10)/10).toFixed(1);
            avg_ratio_arr[m][k] = (Math.round(parseFloat(data[i].avg_ratio)*10)/10).toFixed(1);
          }

          for(j = 0; j < length; j++){
            for(i = j+1; i < length; i++){
              svg.append("rect")
                .attr("x", i * gridWidth)
                .attr("y", startY + j * gridHeight)
                .attr("width", gridWidth)
                .attr("height", gridHeight)
                .attr("stroke","#333")
                .attr("fill",color_arr[j][i])
                .attr("opacity",opacity_arr[j][i]);

              var fontSize = (gridHeight/4);
              if(card_ratio_arr[j][i] != -1){

                svg.append("text")
                  .text(card_ratio_arr[j][i])
                  .attr("x",i*gridWidth + gridWidth/2)
                  .attr("y",startY + j * gridHeight + fontSize/2*3)
                  .attr("text-anchor","middle")
                  .style("font-size",(fontSize+1)+"px")
                  .style("font-weight","bold")
                  .style("fill",function(){
                    if(chart_ratio_arr[j][i] > color_limits[1] && chart_ratio_arr[j][i] < color_limits[2]) return "#000";
                    if(opacity_arr[j][i] < 0.5) return "#000";
                    return "#fff";
                  });
                svg.append("text")
                  .text('('+avg_ratio_arr[j][i]+' avg)')
                  .attr("x",i*gridWidth + gridWidth/2)
                  .attr("y",startY + j * gridHeight + fontSize*3)
                  .attr("text-anchor","middle")
                  .style("font-size",fontSize+"px")
                  .style("fill",function(){
                    if(chart_ratio_arr[j][i] > color_limits[1] && chart_ratio_arr[j][i] < color_limits[2]) return "#000";
                    if(opacity_arr[j][i] < 0.5) return "#000";
                    return "#fff";
                  });

              }
            }
          }
      });
    });  
  };


  function wrap(text, length) {
    text.each(function() {

      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          linerequested = 0,
          lineHeight = 1.3, // ems
          x = text.attr("x"),
          y = text.attr("y"),
          transform = text.attr("transform"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.html().length > length) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dx", "0")
                    .attr("dy", lineHeight + dy + "em")
                    .text(word);
        }
      }
    });
  }
  heatmapChart("data/chart_relval.csv");

