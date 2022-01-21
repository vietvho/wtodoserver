const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

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
app.use('/api',routes);
app.listen(8000);