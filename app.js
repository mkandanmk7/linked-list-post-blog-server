const cors = require("cors");
require("dotenv").config();

const express = require("express");
const DB = require("./db");
const app = express();

//import routes
const POST_ROUTES = require("./routes/posts.routes");

//IIFE function call
(async () => {
    try {
        app.use(cors());
        app.use(express.json());

        //db connected
        await DB.connect();

        //middleware to get server status
        app.get("/", (req, res) => {
            res.status(200).send("server is running successfully");
        });

        //middle wares
        app.get("/", (req, res) => {
            res.status(200).send("<h3>Server is running successfully</h3>")
        })

        //posts middlewares
        app.use("/posts", POST_ROUTES);



        //.env port
        const PORT = process.env.PORT || 4001;

        //server start with port
        app.listen(PORT, () => {
            console.log(`server is running successfully at ${PORT}`);
        });
    } catch (error) {
        console.log(error.message);
    }
})();