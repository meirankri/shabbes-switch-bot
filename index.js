const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const { isSaturday, isFriday, format } = require('date-fns');
const dotenv = require('dotenv');
const { getTimezoneOffset } = require('date-fns-tz');
const knex = require('./dbConnection');
dotenv.config();
const { token, bot1, bot2 } = process.env;

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
const utcParisHourOffset = () => {
  return getTimezoneOffset('Europe/Paris', new Date()) / 3600000;
};

const main = async () => {
  const date = new Date();
  const dateFormated = format(date, 'H.m');
  const hourAndMinNow = parseFloat(dateFormated) + utcParisHourOffset();
  // console.log(satursdayHoursBetween);

  console.log('shabbesHours', satursdayHoursBetween);

  if (isSaturday(date)) {
    console.log('ouech');
    const hourToOpen = satursdayHoursBetween.map(
      hours => hours.startAt < hourAndMinNow && hours.endAt > hourAndMinNow,
    );
    console.log(hourToOpen);
    if (hourToOpen.includes(true)) {
      press(bot1).then(() => {
        setTimeout(() => press(bot2), 5000);
      });
      console.log(date);
    }
  } else if (isFriday(date)) {
    console.log('ouech');
    const hourToOpen = fridayHoursBetween.map(
      hours => hours.startAt < hourAndMinNow && hours.endAt > hourAndMinNow,
    );
    console.log(hourToOpen);
    if (hourToOpen.includes(true)) {
      press(bot1).then(() => {
        setTimeout(() => press(bot2), 5000);
      });
      console.log(date);
    }
  }
};

const satursdayHoursBetween = [
  { startAt: 9, endAt: 10.3 },
  { startAt: 9.45, endAt: 10.3 },
  { startAt: 10.5, endAt: 11.2 },
  { startAt: 12.2, endAt: 12.5 },
  { startAt: 13, endAt: 13.3 },
  { startAt: 14.3, endAt: 15.2 },
  { startAt: 16.4, endAt: 17 },
  { startAt: 19, endAt: 19.45 },
  { startAt: 20.15, endAt: 21.0 },
];
const fridayHoursBetween = [{ startAt: 21.0, endAt: 22.3 }];

main();
press(bot1);

setIntervalAsync(main, 600 * 1000);
console.log(`is chaabes ${isSaturday(new Date())}`);
