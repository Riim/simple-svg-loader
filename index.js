let path = require('path');
let uuid = require('uuid');
let xmldom = require('xmldom');
let xpath = require('xpath');
let SVGO = require('svgo');
let loaderUtils = require('loader-utils');

module.exports = function(content) {
	let callback = this.async();

	let sourceDoc = new xmldom.DOMParser().parseFromString(content, 'text/xml');
	let targetDoc = new xmldom.DOMParser().parseFromString('<symbol></symbol>', 'text/xml');
	let sourceDocEl = sourceDoc.documentElement;
	let targetDocEl = targetDoc.documentElement;

	['viewBox', 'height', 'width', 'preserveAspectRatio'].forEach((name) => {
		let value = sourceDocEl.getAttribute(name);

		if (value) {
			targetDocEl.setAttribute(name, value);
		}
	});

	targetDocEl.setAttribute(
		'id',
		this.resourceQuery && loaderUtils.parseQuery(this.resourceQuery).id || path.basename(this.resourcePath, '.svg')
	);

	for (let node = sourceDocEl.firstChild; node; node = node.nextSibling) {
		targetDocEl.appendChild(targetDoc.importNode(node, true));
	}

	xpath.select('/*/*[@id]', targetDocEl).forEach((node) => {
		let id = node.getAttribute('id');
		let newId = uuid.v4() + '-' + id;

		node.setAttribute('id', newId);

		xpath.select("//attribute::*[contains(., 'url(#" + id + ")')]", targetDocEl).forEach((attr) => {
			attr.value = 'url(#' + newId + ')';
		});
	});

	new SVGO({
		plugins: [{ cleanupIDs: false }]
	}).optimize(new xmldom.XMLSerializer().serializeToString(targetDoc), (result) => {
		callback(
			null,
			'(function _() { if (document.body) { document.body.insertAdjacentHTML(\'beforeend\', ' +
				JSON.stringify(
					'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' + result.data + '</svg>'
				) +
				'); } else { setTimeout(_, 100); } })();'
		);
	});
};
