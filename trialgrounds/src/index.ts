import express from 'express';
import path from 'path';

const app = express();
const PORT = 8000;

app.get('/trialgrounds', function(req, res) {
  res.sendFile(path.join(__dirname, '/trialgrounds.html'));
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});