
var policyCtx = session.name('policyCtx');

/**
 * 
 * START: Modify Parameters
 * 
 * Modify the following parameters (param1/param2/.../param10 based on the number of input parametersr)
 * 
 **/
var inCtx = 'param1';
var authUser = policyCtx.getVar(inCtx);
/**
 * 
 * END: Modify Parameters
 * 
 **/

console.info('IBM API Connect authenticated user %s', authUser);

if (authUser) {
	var xmlString =
		'<token>' +
		authUser +
		'</token>';

	var domTree = undefined;
	try {
		// use XML.parse() to parse the xmlString into a DOM tree structure
		domTree = XML.parse(xmlString);
		session.output.write(domTree);
	} catch (error) {
		// there was an error while parsing the XML string
		console.error('error parsing XML string ' + error);
		throw error;
	}
}
else {
	console.error('Unable to find authenticated user in the HTTP header')
}