const router = require('express').Router();
const User = require('../models/user');
const Todo = require('../models/todo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { collection } = require('../models/user');
const SECRET = 'secret';


router.post('/register',async(req,res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password,salt);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword
        });

        const result = await user.save()
        const token = jwt.sign({_id: result._id},SECRET);
        res.cookie('jwt',token,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        const {password, ...data} = await result.toJSON()

        res.send(data);
    }
    catch (e) {
        if (e.keyPattern && e.keyPattern.email) {
            e.info = "user exist!. Please choose another";
            e.error = true;
        }
        return res.send(e);
    }
});

router.post('/login',async(req,res) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user) {
            return res.send({ message:"user not found"});
        }

        if (!await bcrypt.compare(req.body.password,user.password)) {
            return res.send({ message:"invalid credentials"});
        }

        const token = jwt.sign({_id: user._id},SECRET);
        res.cookie('jwt',token,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        const {password,...data} = user.toJSON();
        data.message = "login-success";
        return res.send(data);
    }
    catch (e) {
        return res.status(401).send(e);
    }
});

router.get('/user', async (req, res) => {
    try {
        const cookie = (req.cookies && req.cookies['jwt']) ? req.cookies['jwt'] : null;
        // console.log(cookie, req.cookies);
        if (!cookie) {
            return res.send({message: "unauthenticated",state: "verified!"});
        }
        const verified = await jwt.verify(cookie,SECRET);
        if (!verified) {
            return res.status(401).send({message: "unauthenticated",state: "verified!"});
        }

        const user = await User.findOne({_id: verified._id});
        const {password,...data} = user.toJSON();
        data.message = "login-success";
        return res.send(data);
    }
    catch(e) {
        return res.send({message: "unauthenticated",state: "error"});
    }
});

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 0})

    res.send({
        message: 'logged-out'
    })
});

router.get('/tasks',async (req,res)=>{
    try {
        const cookie = (req.cookies && req.cookies['jwt']) ? req.cookies['jwt'] : null;
        if (!cookie) {
            return res.send({message: "unauthenticated",state: "verified!"});
        }
        const verified = await jwt.verify(cookie,SECRET);
        if (!verified) {
            return res.status(401).send({message: "unauthenticated",state: "verified!"});
        }

        // if we need to validate user
        // const user = await User.findOne({_id: verified._id});

        const tasks = await Todo.aggregate([
            {
                $match: {userID: verified._id}
            },
            // tach task ra khoi result
            {
                "$unwind": "$tasks"
            },
            //query lai object moi (tasks) // dieu kien trong $match
            // { 
            //     $match: {"tasks.done": true}
            // },
            {
            "$replaceRoot": { "newRoot": "$tasks" }
            }
        ]);
        return res.send({message: 'success', tasks: tasks});
    }
    catch (e) {
        if (e.keyPattern && e.keyPattern.email) {
            e.info = "Get Task failed";
            e.error = true;
        }
        return res.send(e);
    }
});


router.post('/tasks',async(req,res) => {
    try {
        const cookie = (req.cookies && req.cookies['jwt']) ? req.cookies['jwt'] : null;
        if (!cookie) {
            return res.send({message: "unauthenticated",state: "verified!"});
        }
        const verified = await jwt.verify(cookie,SECRET);
        if (!verified) {
            return res.send({message: "unauthenticated",state: "verified!"});
        }

        const result = await Todo.update(
            //query
            {userID: verified._id},
            //set
            {$set: {
                tasks: req.body.tasks
            }},
            // option
            {upsert: true}
        );

        return res.send(result);
        
    }
    catch (e) {
        return res.status(401).send(e);
    }
});

module.exports = router;