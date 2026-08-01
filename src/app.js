const express = require('express');
const authRoutes = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Bank Transaction System API');
});


module.exports = app;
