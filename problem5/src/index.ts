import express from 'express';

import resourceRouter from './routers/resourceRouter';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.use('/resources', resourceRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});