var
    dps = {},    // dps[dpid] = {dpid: 'dpid', ...}
    links = {};  // links[srcDpid][dstDpid] = {source: dp, target: dp, data: ...}

/* @@ZED@@ create entity-to-id functions, both for json and d3 */

/* dp:
   must have a dpid field
   must not have x, y fields */
function addDp(dp) {
    if (dp.chid in dps) {
        console.log('DP already in database:', dp.chid);
        return;
    }
    dps[dp.chid] = dp;
    force.nodes(d3.values(dps));
    refreshDisplay();
}

function removeDp(dp) {
    delete dps[dp.chid]; // remove dp from dps

    delete links[dp.chid]; // remove links with dp as source

    for (src in links) { // remove links with dp as target
        if (dp.chid in links[src]) {
            delete links[src][dp.chid];
        }
    }

    force.nodes(d3.values(dps));
    force.links(d3.merge(d3.values(links).map(function(o) { return d3.values(o); })));
    refreshDisplay();
}

/* link:
    must have src.dpid and dst.dpid */
/* link object is pushed as .data */
function addLink(link) {

    if (link.src.chid in links && link.dst.chid in links[link.src.chid]) {
        console.log('Link already in database:', link.src.chid,'->',link.dst.chid);
        return;
    }

    var srcDp = dps[link.src.chid]
    var dstDp = dps[link.dst.chid]

    if (srcDp === undefined || dstDp == undefined) {
        console.log('Error adding link:', link.src.chid,'->',link.dst.chid);
        return;
    }

    if (!(link.src.chid in links)) {
        links[link.src.chid] = {};
    }

    links[link.src.chid][link.dst.chid] = {source: srcDp, target: dstDp, data: link};

    force.links(d3.merge(d3.values(links).map(function(o) { return d3.values(o); })));
    refreshDisplay();
}

function removeLink(link) {
    if (link.src.chid in links) {
        if (link.dst.chid in links[link.src.chid]) {
            delete links[link.src.chid][link.dst.chid];
        }
    }

    force.links(d3.merge(d3.values(links).map(function(o) { return d3.values(o); })));

    refreshDisplay();
}

function clearTopo() {
    dps = {};
    links = {};

    force.nodes([]);
    force.links([]);

    refreshDisplay();
}
