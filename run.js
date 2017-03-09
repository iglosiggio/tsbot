'use strict';

const TS = require('./ts-wrapper');
const util = require('util');

const commands = {
	server: {},
	channel: {},
	private: {},
};

commands[1] = commands.private;
commands[2] = commands.channel;
commands[3] = commands.server;

function dispatch(dispatchTable, ts) {
	return function dispatch(message) {
		if(message.msg.startsWith('!')) {
			const [command] = message.msg.slice(1).split(' ');
			const fun = dispatchTable[message.targetmode][command];

			if(typeof(fun) === 'function') {
				fun(ts, message);
			}
		}
	}
}

async function run() {
	const ts = TS('tst1.duckdns.org');

	const credentials = require('./credentials');
	const server = { sid: 1 };

	await ts.send('login', credentials);
	await ts.send('use', server);

	const channellist = await ts.send('channellist');

	// const channels = channellist.reduce(function(channels, {cid, channel_name}) {
	// 	channels.byId[cid] = channel_name;
	// 	channels.byName[channel_name] = cid;
	// 	return channels;
	// }, { byId: {}, byName: {} });


	await ts.send('servernotifyregister', { event: 'server' });
	//await ts.send('servernotifyregister', { event: 'channel' });
	await ts.send('servernotifyregister', { event: 'textserver' });
	await ts.send('servernotifyregister', { event: 'textchannel' });
	await ts.send('servernotifyregister', { event: 'textprivate' });


	ts.on('textmessage', dispatch(commands, ts));
}

commands.private.followme = async function followme(ts, message) {
	const clientinfo = await ts.send('clientinfo', { clid: message.invokerid });
	await ts.send('clientmove', { clid: 0, cid: clientinfo.cid });
}

commands.channel.joinchannel = commands.private.joinchannel = async function joinchannel(ts, message) {
	const pattern = message.msg.slice(message.msg.search(' ') + 1);
	const channel = await ts.send('channelfind', { pattern: pattern });
	if(channel.cid) {
		await ts.send('clientmove', { clid: 0, cid: channel.cid });
	} else {
		await ts.send('sendtextmessage', {
			target: 2,
			msg: 'No se ha encontrado el channel "' + pattern + '"'
		});
	}
}

commands.private.say = async function say(ts, message) {
	const text = message.msg.slice(message.msg.search(' ') + 1);
	await ts.send('sendtextmessage', { targetmode: 2, msg: text });
}

commands.private.nick = async function nick(ts, message) {
	const nick = message.msg.slice(message.msg.search(' ') + 1);
	await ts.send('clientupdate', { client_nickname: nick });
}

commands.channel.echo = async function echo(ts, message) {
	const echotext = message.msg.slice(message.msg.search(' ') + 1);
	console.log(echotext);
	await Promise.all([
		ts.send('sendtextmessage', { targetmode: 1, target: message.invokerid, msg: echotext }),
		ts.send('sendtextmessage', { targetmode: 2, msg: echotext })
	]);
}

run()//.catch(console.error);
