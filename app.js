const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

mongoose.connect('mongodb://localhost/wtodo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);
let db = mongoose.connection;
db.on('open',()=>{
    console.log('DB connect');
});
app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:8000']
}));
app.use('/api',routes);
app.listen(8000);