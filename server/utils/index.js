const jwt = require("jsonwebtoken");
const config = require("config");
const multer = require("multer");

const auth = (req, res, next) => {
    const token = req.header("x-auth-token");

    if(!token) {
        res.status(401).json({msg: "token is not available, authorization denied."});
    }

    try {
        jwt.verify(token, config.get("jwtSecret"), (error, decoded) => {
            if(error) {
                res.status(401).json({msg: "token is not available, authorization denied."});
            }
            else {
                req.user = decoded.user;
                next();
            }
        })            
    }
    catch (err) {
        //console.error(err.message);
        res.status(500).json({msg: err.message});
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}`);
    }
});

const upload = multer({storage: storage}).single("file");
 
module.exports = {auth, upload};