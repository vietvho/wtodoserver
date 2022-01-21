const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = 'secret';


router.post('/register',async(req,res) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    const result = await user.save()

    const {password, ...data} = await result.toJSON()

    res.send(data)
    res.send('hello')
});

router.post('/login',async(req,res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        res.status(404).send({message:"user not found"});
    }

    if (!await bcrypt.compare(req.body.password,user.password)) {
        res.status(400).send({message:"invalid credentials"});
    }

    const token = jwt.sign({_id: user._id},SECRET);
    res.cookie('jwt',token,{
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    res.send({message: "login success"});
});

router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];
        const verified = jwt.verify(cookie,SECRET);
        if (!verified) {
            return res.status(401).send({message: "unauthenticated"});
        }

        const user = await User.findOne({_id: verified._id});
        const {password,...data} = user.toJSON();
        res.send(data);

    }
    catch(e) {
            return res.status(401).send({message: "unauthenticated"});
    }
});

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 0})

    res.send({
        message: 'success'
    })
})

module.exports = router;