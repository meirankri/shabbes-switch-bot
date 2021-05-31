const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const { isSaturday, isSunday, format } = require('date-fns');
const express = require('express');
const app = express();
const port = 8888;

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
	const dateFormated = format(date, 'H.m');
	const hourAndMinNow = parseFloat(dateFormated);
	console.log(hourAndMinNow);
	if (isSunday(date)) {
		const hourToOpen = satursdayHoursBetween.map(
			hours => hours.startAt < hourAndMinNow && hours.endAt > hourAndMinNow,
		);
		if (hourToOpen.includes(true)) {
			press(bot1).then(() => {
				setTimeout(() => press(bot2), 5000);
			});
			console.log(date);
		}
	}
};

const satursdayHoursBetween = [
	{ startAt: 9.45, endAt: 10.3 },
	{ startAt: 13, endAt: 13.3 },
	{ startAt: 14.3, endAt: 15.1 },
	{ startAt: 16.4, endAt: 17 },
	{ startAt: 18.3, endAt: 19.15 },
	{ startAt: 18.3, endAt: 21 },
];

app.get('/:id', (req, res) => {
	console.log(req.params.id);
	// setIntervalAsync(main, 1000);
	res.send('ouech alors');
	const int = setInterval(() => console.log(req.params.id), 1000);
	setTimeout(() => clearInterval(int), 7000);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

const intervalRunning = [
	{ running: true, day: 'chabbes', hours: { startAt: 18.3, endAt: 21 } },
	{ running: true, day: 'chabbes', hours: { startAt: 18.2, endAt: 21 } },
];

const checkSetInterval = () => {
	intervalRunning.forEach(interval => {
		if (interval.running) {
			setInterval(main, 2000);
		}
	});
};
checkSetInterval();

console.log(`is chaabes ${isSaturday(new Date())}`);
