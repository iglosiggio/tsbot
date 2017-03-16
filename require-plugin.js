const vm = require('vm');
const fs = require('fs');
const Module = require('module');
const TSBOT_EXTENSION = '.botjs';

const patchedGlobal = {
	describe(object, shortDesc='', longDesc='') {
		object._help = {
			shortDescription: shortDesc,
			longDescription: longDesc
		};
		return object;
	}
};

/* Overwrite global */
patchedGlobal.global = global;
Object.setPrototypeOf(patchedGlobal, global);

function pluginRequire(module, filename) {
	const content = fs.readFileSync(filename, 'utf8');
	const context = Object.create(patchedGlobal);

	context.filename = filename;
	context.exports = module.exports;
	context.module = module;
	context.USE_EXPORTS = false;

	const plugin = vm.runInNewContext(content, context, {
		filename: filename,
		lineOffset: 0,
		displayErrors: true
	});

	if(context.USE_EXPORTS === false) {
		module.exports = plugin;
	}
}

pluginRequire.require = pluginRequire.pluginRequire = pluginRequire;

pluginRequire.init = function init() {
	Module._extensions['.botjs'] = pluginRequire;
	return pluginRequire;
}

module.exports = pluginRequire;
