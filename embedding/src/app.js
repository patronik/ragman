import config from './config.js';
import express from 'express';
import bodyParser from 'body-parser';
import vectorRoutes from './routes/vector.js';

const app = express();
const PORT = config.port || 5000;

app.use(bodyParser.json());
app.use('/vector', vectorRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});