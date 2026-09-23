const WebSocket = require('ws');

function initWs(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  function broadcastState() {
    const payload = JSON.stringify({ type: 'refresh' });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
  }

  wss.on('connection', (ws) => {
    ws.on('error', () => {});
  });

  return broadcastState;
}

module.exports = { initWs };
