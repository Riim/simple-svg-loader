var path = require('path');
var uuid = require('uuid');
var xmldom = require('xmldom');
var xpath = require('xpath');
var SVGO = require('svgo');
var loaderUtils = require('loader-utils');

module.exports = function(content) {
	if (this.cacheable) {
		this.cacheable();
	}

	var callback = this.async();
	var query = loaderUtils.parseQuery(this.query);

	var svgDoc = new xmldom.DOMParser().parseFromString(content, 'text/xml');
	var svgEl = svgDoc.documentElement;
	var targetDoc = new xmldom.DOMParser().parseFromString('<symbol></symbol>', 'text/xml');
	var targetEl = targetDoc.documentElement;

	['viewBox', 'height', 'width', 'preserveAspectRatio'].forEach(function(name) {
		if (svgEl.hasAttribute(name)) {
			targetEl.setAttribute(name, svgEl.getAttribute(name));
		}
	});

	targetEl.setAttribute('id', query.id || path.basename(this.resourcePath, '.svg'));

	for (var el = svgEl.firstChild; el; el = el.nextSibling) {
		targetEl.appendChild(targetDoc.importNode(el, true));
	}

	var nodesWithId = xpath.select('/*/*[@id]', targetDoc);

	nodesWithId.forEach(function(node) {
		var id = node.getAttribute('id');
		var newId = uuid.v4() + '-' + id;

		node.setAttribute('id', newId);

		var attributesUsingId = xpath.select("//attribute::*[contains(., 'url(#" + id + ")')]", targetDoc);

		attributesUsingId.forEach(function(attr) {
			attr.value = 'url(#' + newId + ')';
		});
	});

	var markup = new xmldom.XMLSerializer().serializeToString(targetDoc);
	var svgo = new SVGO({
		plugins: [{ cleanupIDs: false }]
	});

	svgo.optimize(
		markup,
		function(result) {
			callback(
				null,
				'(function _() { if (document.body) { document.body.insertAdjacentHTML(\'beforeend\', ' +
					JSON.stringify(
						'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' + result.data + '</svg>'
					) +
					'); } else { setTimeout(_, 100); } })();'
			);
		}
	);
};
