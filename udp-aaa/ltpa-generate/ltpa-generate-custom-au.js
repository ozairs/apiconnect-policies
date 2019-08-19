// to use xpath, require the 'transform' module
var transform = require('transform');

session.input.readAsXML(function (error, nodelist) {
    var dom = nodelist.item(0).parentNode;
	console.info('dom %s', XML.stringify(dom));
	// use xpath to find the username entry
	//todo: xpath assumes a single entry but there could be multiple items
	transform.xpath('/identity/entry/token/text()', dom, function (error, username) {
		if (error) {
			console.error('error while executing /identity/entry/* xpath - ' + error);
			throw error;
		} else {
			var usernameNode = XML.stringify(username);
			//remove the XML prolog 
			var usernameString = usernameNode.substring(usernameNode.indexOf('>') + 2);
			console.info('username %s', usernameString);
			var xmlString =
				'<credentials>' +
					'<entry type="custom" url="local:///custom_au.xsl">' +
						usernameString +
					'</entry>' + 
				'</credentials>'
			console.info('xml %s', xmlString);
			session.output.write(XML.parse(xmlString));
		}
	})
});