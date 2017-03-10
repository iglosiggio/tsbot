const TS3 = require('node-teamspeak');

function TS(...args) {
	if(!(this instanceof TS)) {
		return new TS(...args);
	}
	this._client = new TS3(...args);
	/*Wrap emit*/
	const oldemit = this._client.emit;
	this._client.emit = function emit(...args) {
		console.info(...args);
		return oldemit.apply(this, args);
	}
}

TS.prototype = {
	send(...args) {
		return new Promise((accept, reject) =>
			this._client.send(...args, (err, response) => {
				if(err) reject([err, response]);
				else accept(response);
			}));
	},
	sendMany(...commands) {
		const commandPromises = commands.map(
			(command) => Array.isArray(command)
				? this.send(...command)
				: this.send(command.name, command.args)
		);
		return Promise.all(commandPromises);
	},
	event(name) {
		return new Promise((accept) =>
			this._client.once(name, accept));
	},
	*events(name) {
		let currentEvent = Promise.resolve('init');

		while(true) {
			currentEvent = currentEvent.then(() => this.event(name))
			yield currentEvent;
		}
	},
	on(...args) {
		return this._client.on(...args);
	}
}

module.exports = TS;
