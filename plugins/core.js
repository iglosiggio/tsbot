module.exports = {
  name: 'Core',
  description: 'Core functionality for the TSBot',
  commands: {
    channel: {
      list_plugins,
      joinchannel
    },
    private: {
      list_plugins,
      followme,
    }
  },

  init(ts) {
    console.log('Loading the core module!');
  }
}

async function list_plugins(ts, message) {
  const response = ts.plugins
    .map(({name, description}) => name + ': ' + description)
    .join('\n');

  return await message.respond(response);
}

async function followme(ts, message) {
	const clientinfo = await ts.send('clientinfo', { clid: message.invokerid });
	await ts.send('clientmove', { clid: 0, cid: clientinfo.cid });
}

async function joinchannel(ts, message) {
	const pattern = message.msg.slice(message.msg.search(' ') + 1);
	const channel = await ts.send('channelfind', { pattern: pattern });
	if(channel.cid) {
		await ts.send('clientmove', { clid: 0, cid: channel.cid });
	} else {
    await message.respond('No se ha encontrado el channel "' + pattern + '"')
	}
}
