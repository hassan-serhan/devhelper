const express = require("express");
const { Model } = require("mongoose");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {auth} = require("../utils");
const router = express.Router();

/*
get req body
validate the req
check if user exists if yes return error
encrypt password
save data in db
using jwt  create token contains user id, return token
*/

//path = /api/users/register      POST
router.post("/register",
    check("name", "Name is required").notEmpty(),
    check("email", "Please include valid email").isEmail(),
    check("password", "Password Length should be at least of 6 characters").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: "user already exists" }] });
            }

            user = new User({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, config.get("jwtSecret"),{expiresIn: "5 days"}, (err, token) => {
                if(err){
                    throw err;
                }
                else{
                    res.json({token});
                }
            });
        }
        catch (err) {
           // console.log(err);
            res.status(500).send(err.message);
        }

    });

//path = /api/users/login      POST
router.post("/login",
    check("email", "Please include valid email").isEmail(),
    check("password", "Password Length should be at least of 6 characters").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, config.get("jwtSecret"),{expiresIn: "5 days"}, (err, token) => {
                if(err){
                    throw err;
                }
                else{
                    res.json({token});
                }
            });
        }
        catch (err) {
          //  console.log(err);
            res.status(500).send(err.message);
        }

    });

    // GET   /api/users  takes a token return user info
    //Private
    router.get("/", auth,
        async(req, res) => {
        try {
            const user = await User.findById(req.user.id).select("-password");
            res.json(user);
        }
        catch (err) {
          //  console.log(err);
            res.status(500).send(err.message);
        }
    })
 
module.exports = router;