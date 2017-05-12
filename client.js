var http = require('http');

var options = {
   host: 'localhost',
   port: '8082',
   path: '/result'  
};

var callback = function(response){
     /* Continuously update stream with data
     * @param {response} str
     */
   var body = '';
   response.on('data', function(data) {
      body += data;
   });
   
   response.on('end', function() {
      console.info('\n client.js:: HTTP response : \n', body);
   });
}

var req = http.request(options, callback);
req.end();  