'use strict';

const TS = require('./ts-wrapper');
const requirePlugin('./require-plugin').init();
const {addToProto} = require('./utils');

function IncomingMessage(ts, message) {
	if(!(this instanceof IncomingMessage)) {
		return new IncomingMessage(message);
	}
	for(const prop in message) {
		this[prop] = message[prop];
	}
	this._ts = ts;
}

IncomingMessage.prototype = {
	async respond(message) {
		return await this._ts.send('sendtextmessage', {
			targetmode: this.targetmode,
			target: this.invokerid,
			msg: message
		});
	}
}

function TSBot (host = 'localhost', port = 10011) {
	if(!(this instanceof TSBot)) {
		return new TSBot(ip);
	}
	TS.call(this, host, port); // Call super

	// Plugin list
	this.plugins = [];
	// Command dispatch table
	const serverCommands = {};
	const channelCommands = {};
	const privateCommands = {};
	this.commands = {
		server: serverCommands,
		channel: channelCommands,
		private: privateCommands,
		1: privateCommands,
		2: channelCommands,
		3: serverCommands
	};
}

TSBot.prototype = Object.create(TS.prototype);
addToProto(TSBot, {
	async start(
		credentials = require('./credentials'),
		server = { sid: 1}
	) {

		await this.send('login', credentials);
		await this.send('use', server);

		await this.sendMany(
			['servernotifyregister', { event: 'server' }],
			['servernotifyregister', { event: 'textserver' }],
			['servernotifyregister', { event: 'textchannel' }],
			['servernotifyregister', { event: 'textprivate' }],
			...(await this.send('channellist')).map(({cid}) =>
				['servernotifyregister', { event: 'channel', id: cid }]
			)
		);

		this.on('textmessage', (message) => this.dispatch(message));
		return this;
	},
	async registerPlugin(path) {
		const plugin = require(path);
		const pluginName = plugin.name || 'Unnamed plugin (' + path + ')';
		this.plugins.push(plugin);

		if(plugin.init instanceof Function) {
			await plugin.init(this);
		}

		for(const table of ['private', 'channel', 'server']) {
			const pluginCmds = plugin.commands[table];
			const botCmds = this.commands[table];

			if(pluginCmds) {
				for(const cmd in pluginCmds) {
					const pluginCmd = pluginCmds[cmd];
					const botCmd = botCmds[cmd];

					if(botCmd) {
						console.error(
							'Error cargando el plugin: %s: El comando %s ya está registrado por el plugin %s',
							plugin.name,
							cmd,
							botCmd.plugin
						);
					} else {
						pluginCmd.plugin = plugin.name;
						botCmds[cmd] = pluginCmd;
					}
				}
			}
		}
	},
	registerPlugins(...args) {
		return Promise.all(args.map((path) => this.registerPlugin(path)));
	},
	dispatch(message) {
		if(message.msg.startsWith('!')) {
			const [cmd] = message.msg.slice(1).split(' ');
			const fun = this.commands[message.targetmode][cmd];

			if(typeof(fun) === 'function') {
				const incomingMessage = new IncomingMessage(this, message)
				fun(this, incomingMessage);
			}
		}
	}
});

module.exports = TSBot;
