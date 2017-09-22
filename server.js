var express = require('express');
var app = express();
app.use('/index.html', express.static(__dirname));
app.listen(3000, function(){ console.log('listening');});