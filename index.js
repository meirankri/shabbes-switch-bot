const axios = require('axios');
const {setIntervalAsync} = require('set-interval-async/dynamic');
const {
  isSaturday,
  isTuesday,
  isWednesday,
  isFriday,
  isMonday,
  format,
} = require('date-fns');
const dotenv = require('dotenv');
const {getTimezoneOffset} = require('date-fns-tz');
const knex = require('./dbConnection');
dotenv.config();
const {token, bot1, bot2} = process.env;

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
  {startAt: 10.0, endAt: 11.2},
  // { startAt: 10.5, endAt: 11.2 },
  {startAt: 12.45, endAt: 13.15},
  {startAt: 14.3, endAt: 15.15},
  {startAt: 16.1, endAt: 16.45},
  {startAt: 18.1, endAt: 18.45},
];

const rochHoursBetween = [
  {startAt: 9.45, endAt: 11.3},
  {startAt: 13, endAt: 14.15},
  {startAt: 16, endAt: 16.3},
  {startAt: 17, endAt: 17.3},
  {startAt: 19.15, endAt: 19.5},
  {startAt: 22, endAt: 23.55},
];

const mondayHoursBetween = [
  {startAt: 19.45, endAt: 20.15},
  {startAt: 21, endAt: 23.55},
];

const fridayHoursBetween = [
  // { startAt: 19.45, endAt: 20.15 },
  // { startAt: 21.3, endAt: 23 },
];

main();
press(bot1);

setIntervalAsync(main, 600 * 1000);
console.log(`is chaabes ${isSaturday(new Date())}`);
