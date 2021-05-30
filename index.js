const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const { isSaturday, getHours } = require('date-fns');

const { token, bot1, bot2 } = require('./keys.json');

const press = botId => {
	console.log('preessed', botId);
	return axios
		.post(
			`https://api.switch-bot.com/v1.0/devices/${botId}/commands`,
			{
				command: 'press',
				parameter: 'default',
				commandType: 'command',
			},
			{
				headers: {
					Authorization: token,
				},
			},
		)
		.then(res => console.log('res', res.data))
		.catch(e => console.error('err', e));
};

const main = () => {
	const date = new Date();
	if (isSaturday(date)) {
		if (satursdayHours.includes(getHours(date))) {
			press(bot1).then(() => {
				setTimeout(() => press(bot2), 5000);
			});
			console.log(date);
		}
	}
};

const satursdayHours = [10, 13, 14, 15, 16, 19, 20];
setIntervalAsync(main, 10000);
console.log(`is chaabes ${isSaturday(new Date())}`);
