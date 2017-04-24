var jsonfile = require('jsonfile');
var http = require('http');

var result = "";
const PORT = 8081;

var data = JSON.stringify({
  'id': '2'   //Convert js object in to string before sending it to server
});

var file = './config.json';
var obj = jsonfile.readFileSync(file);
var reqOptions = {
  host: obj.host,
  path: obj.path,
  method: obj.method,
  headers: obj.headers
};

//HTTP Request to fetch data from API
var req = http.get(reqOptions, function(resp) {
  var msg = '';
  resp.setEncoding('utf8');
  
  console.log('\n server.js:: statusCode:', resp.statusCode);
  console.log('\n server.js:: header:', resp.headers);

  resp.on('data', function(chunk) {
    msg += chunk;
  });
  resp.on('end', function() {
    result+=msg;
  });
  resp.on('error', function(e) {
    console.error('\n server.js:: Error while doing HTTP reqquest on web service, Exception is: ', e);
  });
});

req.end();  //End the HTTP request  

//create dispatcher for dynamic pages and static resources
var dispatcher = require('httpdispatcher');
var httpDispatcher = new dispatcher();
var httpServer=http.createServer(function(request, response) {
  httpDispatcher.dispatch(request, response);
});

httpServer.listen(PORT, function() {
  console.log('\n server.js:: Server listening on: http://localhost:%s', PORT);
});

//handle HTTP requests and response
httpDispatcher.setStatic('misc');
httpDispatcher.onGet("/researcher", function(req, resp) {
    var body = [];

    req.on('error', function(err) {
      console.error(err);
    }).on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();

      resp.on('error', function(err) {
        console.error(err);
      });

      if(result) {  //Long polling
        resp.statusCode = 200;
        resp.setHeader('Content-Type', 'application/json');
        resp.write(result);
        result="";
        resp.end();
      }
    });
});

httpDispatcher.onError(function (req, resp) {
  resp.writeHead(404);
  resp.end();
});

httpDispatcher.beforeFilter(/\//, function(req, resp, chain) { //any url 
    console.info('\n server.js:: Before filter. Modify the filter here before calling the URL.');
    chain.next(req, resp, chain);
});
 
httpDispatcher.afterFilter(/\//, function(req, resp, chain) { //any url 
    console.info('\n server.js:: After filter. Modify the filter here after getting response from the URL.');
    chain.next(req, resp, chain);
});

// dispatcher.onPost("/page2", function(req, resp) {
//     resp.writeHead(200, {'Content-Type': 'application/json'});
//     resp.end('Page Two');
// });