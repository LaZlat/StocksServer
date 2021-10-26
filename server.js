const app = require('./app')

var server = app.listen(3001, function() {
    console.log("Server started on port 3001");
});