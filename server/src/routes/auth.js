const app = require('../index.js').app;
const pg = require('../config/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {authenticateToken} = require('../middleware.js');
const {generateAccessToken, generateRefreshToken} = require('../helpers.js');

module.exports = app => {
  app.post('/user/register', async (req, res) => {
    try {
      const {firstName, lastName, username, email, password} = req.body;

      const passhash = await bcrypt.hash(password, 10);

      await pg.query(
        'INSERT INTO users (first_name, last_name, username, email, passhash) VALUES($1, $2, $3, $4, $5)',
        [firstName, lastName, username, email, passhash]
      );

      const userQuery = await pg.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      const newId = userQuery.rows[0].id;

      const accessToken = generateAccessToken(newId);
      const refreshToken = generateRefreshToken(newId);

      await pg.query('INSERT INTO refresh_tokens (token) VALUES($1)', [
        refreshToken,
      ]);

      res.json({success: true, accessToken, refreshToken});
    } catch (err) {
      const errPayload = {success: false};

      if (err.code === '23505') {
        switch (err.constraint) {
          case 'username_unique':
            errPayload.message = 'Username is already taken';
            break;
          case 'email_unique':
            errPayload.message = 'Email is already being used';
            break;
        }
      } else {
        errPayload.message = 'An error has occured';
      }

      res.json(errPayload);
    }
  });

  app.post('/user/login', async (req, res) => {
    try {
      const {email, password} = req.body;

      const userQuery = await pg.query('SELECT * FROM users WHERE email = $1', [
        email,
      ]);

      if (userQuery.rowCount === 0) {
        return res.json({
          success: false,
          message: 'No user exists with this email',
        });
      }

      const user = userQuery.rows[0];

      const passwordIsCorrect = await bcrypt.compare(password, user.passhash);

      if (!passwordIsCorrect) {
        return res.json({
          success: false,
          message: 'Email or password is incorrect',
        });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      await pg.query('INSERT INTO refresh_tokens (token) VALUES($1)', [
        refreshToken,
      ]);

      res.json({success: true, accessToken, refreshToken});
    } catch {
      res.json({success: false, message: 'An error has occured'});
    }
  });

  app.post('/token', async (req, res) => {
    try {
      const refreshToken = req.body.token;
      if (!refreshToken) return res.sendStatus(401);

      const tokenQuery = await pg.query(
        'SELECT * FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );

      if (tokenQuery.rowCount === 0) return res.sendStatus(403);
      const queryToken = tokenQuery.rows[0].token;
      jwt.verify(queryToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken(user.id);
        res.json({success: true, accessToken});
      });
    } catch {
      return res.json({success: false, message: 'An error has occured'});
    }
  });

  app.delete('/token', authenticateToken, async (req, res) => {
    try {
      const refreshToken = req.headers.token;
      if (!refreshToken) return res.sendStatus(401);

      await pg.query('DELETE FROM refresh_tokens WHERE token = $1', [
        refreshToken,
      ]);

      return res.json({success: true});
    } catch {
      return res.json({success: false});
    }
  });

  app.get('/user', authenticateToken, async (req, res) => {
    try {
      const userQuery = await pg.query('SELECT * FROM users WHERE id = $1', [
        req.user.id,
      ]);
      res.json({success: true, user: userQuery.rows[0].username});
    } catch (err) {
      res.json({success: false, message: err.message});
    }
  });
};
