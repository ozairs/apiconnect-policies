var ms     = require ('multistep');

/**
 * 
 * START: Modify Parameters
 * 
 * Modify the following parameters (param1/param2/.../param10 based on the number of input parameters)
 * 
 **/
 
var param1 = context.get(context.get('param1'));
console.info ("param1 %s", param1);

if (param1 == null || param1 == '') {
    context.reject('Invalid Parameter', 'The paramater param1 you provided is invalid');
    context.message.statusCode = '401 Unauthorized';
}

//modify (JSON.stringify | JSON.stringify) to reflect in the input payload
var payload = context.get('message.body');
console.info ("payload %s", XML.stringify(payload));


if (payload == null) {
    context.reject('Invalid Parameter', 'The paramater payload you provided is invalid');
    context.message.statusCode = '401 Unauthorized';
}

var jsonBody = {
    "param1" : param1,
    "payload" : XML.stringify(payload)
}

/**
 * 
 * END: Modify Parameters
 * 
 **/



var inputMessage = context.createMessage('inputCtx');
inputMessage.body.write(jsonBody);

var inputCtx = 'inputCtx';
var outputCtx = 'outputCtx';

var rule = context.get('rule-name');
console.info ("rule-name %s", rule);

try {
    ms.callRule (rule, inputCtx, outputCtx, function(error) {
        var result = null;
        //check if output context variable is defined
        if (outputCtx != '') {
            console.info("output context %s", JSON.stringify(outputCtx));
            result = context.get(outputCtx + '.body');
        }
        if (error) {
            console.error(error);
            session.output.write(error);
        } else if (outputCtx != '') {
            console.info("writing result %s", result);
            session.output.write(result);
        }
    });
} catch (error) {
    console.error(error);
    session.output.write(error);
}