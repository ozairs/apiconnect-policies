/**
 * 
 * START: Modify Parameters
 * 
 * Modify the following parameters (param1/param2/.../param10 based on the number of input parametersr)
 * 
 **/
var inCtx = 'param1';
var inCtx2 = 'payload';
/**
 * 
 * END: Modify Parameters
 * 
 **/

// Read the input as a JSON object
session.input.readAsJSON(function (error, json) {
  if (error) {
    throw error;
  }

  console.notice('json', JSON.stringify(json));

  var ctx = session.name('policyCtx') || session.createContext('policyCtx');
  ctx.setVar(inCtx, json[inCtx]);

  //modify (JSON.stringify | JSON.stringify) to reflect in the input payload
  session.output.write(XML.parse(json[inCtx2]));
});