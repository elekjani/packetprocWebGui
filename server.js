/* configuration parameters */
var
	httpPort = 8080;
	noxPort = 2703;
	noxHost = 'localhost';

/* modules */
var
	http       = require('http'),
	net        = require('net'),
	url        = require('url'),
	nodestatic = require('node-static'),
	socketio   = require('socket.io');

/* globals */
var
    webClient = null,
    jsonBufferLen = 65536,
    jsonBuffer = new Buffer(jsonBufferLen),
    jsonBufferSize = 0;


/* file server */
var fileServer = new nodestatic.Server('./webroot', {cache: 3600});

/* http server */
var httpServer = http.createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
	});
	if (url.parse(request.url).pathname == '/') {
		request.url = '/index.html';
	}
});

/* WebSocket server*/
var ws = socketio.listen(httpServer);
ws.configure(function() {
	ws.set('log level', 0);
//	ws.set('transports', ['websocket']); /* only for chrome */
//	ws.set('polling duration', 1);
//	ws.set('heartbeat timeout', 1);
//	ws.set('heartbeat interval', 3);
});

/* start */
httpServer.listen(httpPort);
console.log('node.js http server started on port ' + httpPort);



/* WebSocket */

ws.sockets.on('connection', function (socket) {
	console.log('Client connected:', socket.id);
	/* @@ZED@@ make sure the same id is not used twice
	   i.e. do not replace something that will later disconnect */
	webClient = socket;
	socket.on('webgui', function(event) {
	console.log('Received message from socket:', event);
	tcp.write(JSON.stringify(event));
	});
	socket.on('disconnect', function() {
		console.log('Client disconnected:', socket.id);
		webClient = null;
	});
});


function processTcpData(msg) {
	json = JSON.parse(msg.toString());
	console.log('NOX data:\n', json);
	webClient.emit('webgui', json);
}

/* json msg size is sent in two bytes */
function handleTcpData(data) {
	console.log('handleTcpData bufSize:', jsonBufferSize, 'dataLen:', data.length);
	if (jsonBufferSize == 0) {
	    /* nothing is buffered */
	    msgSize = parseInt(data[0]) * 256 + parseInt(data[1]);
	
	    if (data.length >= msgSize + 2) {
	    	processTcpData(data.slice(2, msgSize + 2));
	    	if (data.length > msgSize + 2) {
	    		handleTcpData(data.slice(msgSize + 2)); /* @@ZED@@ recursion */
	    	}
	    } else {
	    	console.log("Received partial json");
	    	data.copy(jsonBuffer);
	    	jsonBufferSize = data.length;
	    }

	// if there were buffered messages, copy received data over, and handle that
	} else {
	    if (data.length > 0) {
	        // if buffer is not big enough, double its size
	        // BUG: double might not be enough, check the required size
//                          do {
//                              this.length *= 2;
//                          } while (this.length < this.size + data.length - offset);
	        
			if (jsonBufferLen < jsonBufferSize + data.length) {
			    jsonBufferLen *= 2;
			    newBuffer = new Buffer(jsonBufferLen);
			    jsonBuffer.copy(newBuffer, 0, 0, jsonBufferSize);
			    jsonBuffer = newBuffer;
			}
			data.copy(jsonBuffer, jsonBufferSize);
			jsonBufferSize += data.length;
	    }
	
	    // see if message can be processed
	    msgSize = parseInt(jsonBuffer[0]) * 256 + parseInt(jsonBuffer[1]);
	    console.log('msgSize in buffer:', msgSize);
	    if (jsonBufferSize >= msgSize + 2) {
	    	processTcpData(jsonBuffer.slice(2, msgSize + 2));
	    	
	    	if (jsonBufferSize > msgSize + 2) {
	    		// realloc buffer with remaining data
	    		newBuffer = new Buffer(jsonBufferLen);
	    		jsonBuffer.copy(newBuffer, 0, msgSize + 2, jsonBufferSize);
	    		jsonBuffer = newBuffer;
	    		jsonBufferSize -= (msgSize + 2);
	    		handleTcpData(new Buffer(0)); /* @@ZED@@ recursion */
	    	} else {
	    		jsonBuffer = new Buffer(jsonBufferLen);
	    		jsonBufferSize = 0;
	    	}
	    }
	}
	
}

/* TCP */
var tcp = net.createConnection(noxPort, noxHost);

tcp.addListener('connect', function() {
    console.log('NOX connected');
});

tcp.addListener('close', function() {
    console.log('NOX disconnected');
});

tcp.addListener('error', function(err) {
    console.log('NOX error:', err);
});

tcp.addListener('data', function(data) {
    console.log('tcpData size:', data.length, ':\n', data);
    handleTcpData(data);
    try {
    } catch (err) {
	console.log('parse error:\n', err);
    }
});
