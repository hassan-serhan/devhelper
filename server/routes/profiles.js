const express = require("express");
const router = express.Router();
const { Model } = require("mongoose");
const { auth, upload } = require("../utils");
const Profile = require("../models/Profile");
const User = require("../models/User");
const Post = require("../models/Post");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");

// add or update a profile for logged in user
router.post("/",
    auth,
    check("status", "Status is required").notEmpty(),
    check("skills", "skills is required").notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
 
        const { website, skills, youtube, twitter, instagram, linkedin, facebook, github, ...rest } = req.body;

        const profile = {
            user: req.user.id,
            website: website && website !== "" ? normalize(website, { forceHttps: true }) : "",
            skills: Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim()),
            ...rest
        }

        const socialFields = { youtube, twitter, instagram, linkedin, facebook, github };

        for (let key in socialFields) {
            const value = socialFields[key];
            if (value && value !== "")
                socialFields[key] = normalize(value, { forceHttps: true });
        }

        profile.social = socialFields;

        try {
            let profileObject = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profile },
                { new: true, upsert: true }
            );
            return res.json(profileObject);
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    });

//get the profile of the logged in user
router.get("/me",
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne(
                { user: req.user.id }
            ).populate("user", ["name"]);

            if (!profile) {
                return res.status(400).json({ msg: "There is no profile for this user" });
            }
            res.json(profile);
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    });

//get all profiles
router.get("/",
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.find().populate("user", ["name"]);
            res.json(profile);
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    });

//get a pecific profile passing id of user
router.get("/user/:user_id",
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne(
                { user: req.params.user_id }
            ).populate("user", ["name"]);

            if (!profile) {
                return res.status(400).json({ msg: "There is no profile for the given user" });
            }

            res.json(profile);
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    });

//delete user posts profile and his credentials
router.delete("/",
    auth,
    async (req, res) => {
        // remove posts -> profile -> user
        try {
            await Promise.all([
                Post.deleteMany({user: req.user.id}),
                Profile.findOneAndDelete({ user: req.user.id }),
                User.findOneAndDelete({ _id: req.user.id })
            ]);
            res.json({ msg: "User information is deleted successfuly" });
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    }
);

// use multer lib to upload an image and save it in public/images folder
router.post("/upload", auth, async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                res.status(500).send(`server error: ${err}`);
            }
            else {
                res.status(200).send(req.user.id);
            }
        });
    }
    catch (err) {
        //console.error(err.message);
        return res.status(500).send(err.message);
    }
});

// add an experience
router.put("/experience", auth,
    check("title", "title is required").notEmpty(),
    check("company", "company is required").notEmpty(),
    check("from", "from date is required and needs to be from the past")
        .notEmpty()
        .custom((value, { req }) => {
            return req.body.to ? value < req.body.to : true;
        }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const profile = await Profile.findOne({user: req.user.id});

            profile.experience.unshift(req.body);
            await profile.save();
            return res.json(profile);
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    }
);

// delete an experience
router.delete("/experience/:exp_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.experience = profile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);
        await profile.save();
        return res.json(profile);
    }
    catch (err) {
        //console.error(err.message);
        return res.status(500).send(err.message);
    }
});

// add an education
router.put("/education", auth,
    check("school", "School is required").notEmpty(),
    check("degree", "Degree is required").notEmpty(),
    check("fieldofstudy", "Field Of Study is required").notEmpty(),
    check("from", "from date is required and needs to be from the past")
        .notEmpty()
        .custom((value, { req }) => {
            return req.body.to ? value < req.body.to : true;
        }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const profile = await Profile.findOne({user: req.user.id});

            profile.education.unshift(req.body);
            await profile.save();
            return res.json(profile);
        }
        catch (err) {
            //console.error(err.message);
            return res.status(500).send(err.message);
        }
    }
);

// delete an education
router.delete("/education/:edu_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.education = profile.education.filter(edu => edu._id.toString() !== req.params.edu_id);
        await profile.save();
        return res.json(profile);
    }
    catch (err) {
        //console.error(err.message);
        return res.status(500).send(err.message);
    }
});


module.exports = router;