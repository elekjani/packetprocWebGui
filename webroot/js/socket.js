var socket = io.connect(); /* same host/port as http */

socket.on('connect', function() {
	$.jGrowl('Connection established.', { header: 'Web server', theme: 'notification success', life: 5000 });
	webStatus(true);

	/* @@ZED@@ move to communication.js */
	socket.emit('webgui', {type: 'lldp', message: 'topo'});
});

socket.on('disconnect', function() {
	$.jGrowl('Connection lost.', { header: 'Web server', theme: 'notification failure', life: 5000 });
	webStatus(false);
});

socket.on('webgui', function (data) {
    console.log(data);

    if (data.message == 'topo') {
	var dpsNum = data.dps.length;
	var linksNum = data.links.length;

	$.jGrowl("DPs: " + dpsNum + ", links: " + linksNum, { header: 'Topology', theme: 'notification' });

	clearTopo();
	for (var i in data.dps) {
	    addDp(data.dps[i]);
	}
	for (var i in data.links) {
	    addLink(data.links[i]);
	}
    } else if (data.message == 'dp') {
	if (data.event == 'join') {
	    $.jGrowl(data.dp.chid, {header: 'DP join', theme: 'notification' });
	    addDp(data.dp);
	} else {
	    $.jGrowl(data.dp.chid, {header: 'DP leave', theme: 'notification' });
	    removeDp(data.dp);
	}
    } else if (data.message == 'link') {
	if (data.event == 'add') {
	    $.jGrowl(data.link.src.chid + " -> " + data.link.dst.chid, {header: 'Link add', theme: 'notification' });
	    addLink(data.link);
	} else {
	    $.jGrowl(data.link.src.chid + " -> " + data.link.dst.chid, {header: 'Link remove', theme: 'notification' });
	    removeLink(data.link);
	}
    }
});
