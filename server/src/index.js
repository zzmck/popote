const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const { PORT, DATA_DIR } = require('./config');
require('./db');
const { initWs } = require('./ws');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const broadcastState = initWs(server);

app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path.startsWith('/api') && req.method !== 'GET' && res.statusCode < 400) {
      broadcastState();
    }
  });
  next();
});

app.use('/api', require('./routes/state'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/popotiers'));
app.use('/api', require('./routes/config'));
app.use('/api', require('./routes/onboarding'));
app.use('/api', require('./routes/popotes'));
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/members'));
app.use('/api', require('./routes/transactions'));
app.use('/api', require('./routes/cash'));
app.use('/api', require('./routes/shopping'));

const clientDir = path.join(__dirname, '..', '..', 'client');
app.use(express.static(clientDir));
app.get('*', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));

server.listen(PORT, () => console.log(`Popote API + WebSocket prêts sur le port ${PORT} (données dans ${DATA_DIR})`));
