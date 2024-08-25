const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// register main apis
app.use("/api/users", require("./routes/users"));

app.use("/api/profiles", require("./routes/profiles"));

app.use("/api/posts", require("./routes/posts"));

app.get("/", (req, res) => {
    res.send("server is working correctly");
});

app.use(express.static(__dirname + '/public'))

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    //console.log("Server started on port " + PORT);
})