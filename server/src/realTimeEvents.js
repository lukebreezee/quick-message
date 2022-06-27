module.exports = io => {
  io.on('connection', () => {
    console.log('client connected');
  });
};
