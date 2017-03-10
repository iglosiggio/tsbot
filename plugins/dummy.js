module.exports = {
  name: 'Dummy',
  description: 'A test module',
  commands: {
      private: {
        echo
      },
      channel: {
        echo,
        say,
        nick
      }
  },

  init(ts) {
    console.log("[DUMMY] Init!");
  }
};

async function echo(ts, message) {
	const echotext = message.msg.slice(message.msg.search(' ') + 1);
	console.log(echotext);
	await ts.sendMany(
		['sendtextmessage', { targetmode: 1, target: message.invokerid, msg: echotext }],
		['sendtextmessage', { targetmode: 2, msg: echotext }]
	);
}

async function say(ts, message) {
	const text = message.msg.slice(message.msg.search(' ') + 1);
	await ts.send('sendtextmessage', { targetmode: 2, msg: text });
}

async function nick(ts, message) {
	const nick = message.msg.slice(message.msg.search(' ') + 1);
	await ts.send('clientupdate', { client_nickname: nick });
}
