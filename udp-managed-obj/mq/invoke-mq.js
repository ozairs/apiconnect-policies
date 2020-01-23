var apim = require('apim');
var url = require('urlopen');

/**
 * 
 * START: Modify Parameters
 * 
 * Modify the following parameters (param1/param2/.../param10 based on the number of input parameters)
 * 
 **/

//param1 is the MQ Queue Manager object name
var param1 = context.get('param1');
console.info ("param1 %s", param1);

if (param1 == null || param1 == '') {
    context.reject('Invalid Parameter', 'The paramater param1 you provided is invalid');
    context.message.statusCode = '401 Unauthorized';
}

//param2 is the request queue name
var param2 = context.get('param2');
console.info ("param2 %s", param2);

if (param2 == null || param2 == '') {
    context.reject('Invalid Parameter', 'The paramater param2 you provided is invalid');
    context.message.statusCode = '401 Unauthorized';
}

/**
 * 
 * END: Modify Parameters
 * 
 **/

//console.info('data %s', context.get("message.body"));

var options = { target: 'dpmq://' + param1 + '/?',
    //requestQueue: 'DEV.QUEUE.1',
    requestQueue: param2,
    //replyQueue: '',
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
    console.info("Successfully put message with code %s", responseCode);
});