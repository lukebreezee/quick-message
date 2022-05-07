const pg = require('pg');

module.exports = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'quickmessage',
});
