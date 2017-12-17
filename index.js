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

	let attrs = sourceDocEl.attributes;

	for (let i = 0, l = attrs.length; i < l; i++) {
		let attr = attrs.item(i);
		targetDocEl.setAttribute(attr.name, attr.value);
	}

	targetDocEl.setAttribute(
		'id',
		(this.resourceQuery && loaderUtils.parseQuery(this.resourceQuery).id) ||
			path.basename(this.resourcePath, '.svg')
	);

	for (let node = sourceDocEl.firstChild; node; node = node.nextSibling) {
		targetDocEl.appendChild(targetDoc.importNode(node, true));
	}

	['/*/*[@id]', '/*/*/*[@id]'].forEach(selector => {
		xpath.select(selector, targetDocEl).forEach(node => {
			let id = node.getAttribute('id');
			let newId = uuid.v4() + '-' + id;

			node.setAttribute('id', newId);

			xpath.select("//@*[contains(., '#" + id + "')]", targetDocEl).forEach(attr => {
				if (attr.value == '#' + id) {
					attr.value = '#' + newId;
				} else if (attr.value == 'url(#' + id + ')') {
					attr.value = 'url(#' + newId + ')';
				}
			});
		});
	});

	new SVGO({
		plugins: [{ cleanupIDs: false }]
	})
		.optimize(new xmldom.XMLSerializer().serializeToString(targetDoc))
		.then(result => {
			callback(
				null,
				"(function _() { if (document.body) { document.body.insertAdjacentHTML('beforeend', " +
					JSON.stringify(
						'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
							result.data +
							'</svg>'
					) +
					'); } else { setTimeout(_, 100); } })();'
			);
		});
};
