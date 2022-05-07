const app = require('../index.js').app;
const pg = require('../config/db.js');
const {authenticateToken} = require('../middleware.js');

app.get('/users', authenticateToken, async (req, res) => {
  try {
    const usersQuery = await pg.query(
      'SELECT id, username FROM users WHERE id != $1',
      [req.user.id]
    );

    return res.json({success: true, users: usersQuery.rows});
  } catch {
    return res.json({success: false, message: 'An error has occured'});
  }
});

app.get('/conversation', authenticateToken, async (req, res) => {
  try {
    const {id} = req.user;

    const conversationQuery = await pg.query(
      'SELECT * FROM conversations WHERE $1 <@ users_in_conversation',
      [[id, parseInt(req.headers['other-end-uid'])]]
    );

    if (conversationQuery.rows.length === 0) {
      return res.json({success: false, message: 'Conversation not found'});
    }

    return res.json({
      success: true,
      conversation: conversationQuery.rows[0],
      message: 'Conversation found',
    });
  } catch (e) {
    return res.json({success: false, message: 'An error has occurred'});
  }
});

app.post('/conversation', authenticateToken, async (req, res) => {
  try {
    const {usersInConversation} = req.body;
    const now = new Date();

    await pg.query(
      'INSERT INTO conversations (users_in_conversation, updated_at) VALUES($1, $2)',
      [[...usersInConversation, req.user.id], now]
    );

    const newConversationQuery = await pg.query(
      'SELECT * FROM conversations WHERE $1 <@ users_in_conversation',
      [[...usersInConversation, req.user.id]]
    );

    return res.json({
      success: true,
      message: 'Conversation created',
      conversation: newConversationQuery.rows[0],
    });
  } catch (e) {
    return res.json({success: false, message: 'An error has occurred'});
  }
});

app.get('/conversation/all', authenticateToken, async (req, res) => {
  try {
    const conversationsQuery = await pg.query(
      'SELECT * FROM conversations WHERE $1 <@ users_in_conversation ORDER BY updated_at DESC',
      [[req.user.id]]
    );

    return res.json({
      success: true,
      message: 'Conversations found',
      conversations: conversationsQuery.rows,
    });
  } catch {
    return res.json({
      success: false,
      message: 'An unexpected error has occurred',
      conversations: null,
    });
  }
});

app.get('/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.headers['conversation-id'];

    const messagesResponse = await pg.query(
      'SELECT * FROM messages WHERE conversation_id = $1',
      [conversationId]
    );

    return res.json({
      success: true,
      messages: messagesResponse.rows,
      message: 'Messages found',
    });
  } catch {
    return res.json({success: false, message: 'An error has occurred'});
  }
});

app.post('/messages', authenticateToken, async (req, res) => {
  try {
    const {conversationId, text} = req.body;
    const now = new Date();

    await pg.query(
      'INSERT INTO messages (conversation_id, sender_id, text, created_at) VALUES($1, $2, $3, $4)',
      [conversationId, req.user.id, text, now]
    );

    return res.json({success: true});
  } catch (e) {
    return res.json({success: false, message: 'An error has occurred'});
  }
});
