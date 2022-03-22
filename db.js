

const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URL);

module.exports = {
    //initalize ;intially null;
    db: null,
    posts: null,


    async connect() {
        //db connection
        await client.connect();
        console.log("db connected");

        //db selected;
        this.db = client.db(process.env.MONGODB_NAME);
        console.log(`${process.env.MONGODB_NAME} is selected`);

        //choosing db collections
        this.posts = this.db.collection("posts");

    },
};