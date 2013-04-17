var vis;
var force = self.force = d3.layout.force()
                                  .nodes([])
                                  .links([])
                                  .gravity(.05)
                                  .distance(200)
                                  .charge(-600);

force.on("tick", function() {
    var node = vis.selectAll("g.node")
                  .data(d3.values(dps), function(d) { return d.chid;} )

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    var link = vis.selectAll("line.link")
                  .data(d3.merge(d3.values(links).map(function(o) { return d3.values(o); })),
                        function(d) { return d.source.chid + '-' + d.target.chid})

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
});



function refreshDisplay() {
    var node = vis.selectAll("g.node")
                  .data(d3.values(dps), function(d) { return d.chid;}).call(force.drag);

    var nodeG = node.enter().append("svg:g")
                            .attr("class", "node")
                            .attr("render-order", 1)
                            .call(force.drag);

    /* @@ZED@@ svg size: 100,153 */
    nodeG.append("svg:image")
         .attr("class", "circle") /* @@ZED@@ classes */
         .attr("render-order", 1)
         .attr("xlink:href", "/img/ROUTER_SWITCH.svg")
         .attr("x", "-64px")
         .attr("y", "-64px")
         .attr("transform", "scale(0.5)")
         .attr("width", "138px") //.attr("width", "16px")
         .attr("height", "200px"); //.attr("height", "16px");

    nodeG.append("svg:text")
         .attr("class", "nodetext")
         .attr("render-order", 1)
         .attr("dx", 0) //.attr("dx",  12)
         .attr("dy", 40) //.attr("dy", ".35em")
         .attr("text-anchor", "middle")
         .text(function(d) { return d.chid });

    node.exit().remove();


    var link = vis.selectAll("line.link")
                  .data(d3.merge(d3.values(links).map(function(o) { return d3.values(o); })),
                        function(d) { return d.source.chid + '-' + d.target.chid})

    link.enter().append("svg:line")
                .attr("class", "link")
                .attr("render-order", 2)
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

    link.exit().remove();

    force.start();
};

$(document).ready(function() {
    vis = d3.select("#topologyDisplay");

    force.size([$('#topologyDisplay').width(),
                $('#topologyDisplay').height()])

    force.start();
    refreshDisplay();
});
