const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());


/* 
   - Routes required
*/
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');

/* 
   -User Routes
*/
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Bank Transaction System API');
});


module.exports = app;
