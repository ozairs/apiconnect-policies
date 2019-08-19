var url = require('urlopen');

console.info('data %s', context.get("message.body"));

var options = { target: 'dpmq://' + 'IBM_CLOUD_QM' + '/?',
     requestQueue: 'DEV.QUEUE.1',
    //   replyQueue: '',
       //headers: mqHeader
    transactional: false,
             sync: false,
          timeOut: 10000,
             data: context.get("message.body") };

url.open (options, function (err, resp) {
    if (err) {
        var errorMessage = err + 'errorCode=' + err.errorCode.toString(16);
        console.error("Error %s", errorMessage);
        throw err;
    }
    var responseCode = resp.statusCode; 
    console.error("Successfully put message with code %s", responseCode);
});