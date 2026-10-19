require('dotenv').config();
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/student.routes');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/students', studentRoutes);

app.use('/api/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));