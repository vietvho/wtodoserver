const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = 'secret';

router.post('/register',async(req,res) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);
    console.log(hashPassword);
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    const result = await user.save()

    const {password, ...data} = await result.toJSON()

    res.send(data)
    // res.send(user.save());
    res.send('hello')
});

router.post('/login',async(req,res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        res.send({message:"user not found"});
    }

    if (!await bcrypt.compare(req.body.password,user.password)) {
        res.send({message:"invalid credentials"});
    }

    const token = jwt.sign({_id: user._id},SECRET);

    res.send({message: "login success","token": token});
});

module.exports = router;