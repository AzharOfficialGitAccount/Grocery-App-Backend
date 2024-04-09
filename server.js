const express = require('express');
const app = express();
const userRoutes = require('./router/user');

const PORT = process.env.port || 4000;
require('./config/conn');

app.use(express.json());

app.use('/api/user', userRoutes);

app.listen(PORT, () => {
    console.log(`server is running on : ${PORT}`);
});