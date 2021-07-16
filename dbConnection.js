const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'sql4.freesqldatabase.com',
    user: 'sql4421273',
    password: 'dXdrhNJ5H9',
    database: 'sql4421273',
  },
});
module.exports = knex;
