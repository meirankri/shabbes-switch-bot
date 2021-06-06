const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const { isSaturday, isSunday, format } = require('date-fns');

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

  if (isSaturday(date)) {
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
  { startAt: 18.45, endAt: 19.3 },
];

const satursdayHours = [10, 13, 14, 15, 16, 19, 20];
setIntervalAsync(main, 600 * 1000);
console.log(`is chaabes ${isSaturday(new Date())}`);
