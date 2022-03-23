const { ObjectId } = require("mongodb");
const db = require("../db");
const genNanoId = require("../helper/genNanoId");

const service = {

    async createPost(req, res) {
        try {
            const data = req.body;
            let postId = genNanoId();

            let createdDate = Math.floor(new Date().getTime() / 1000.0);
            // console.log(createdDate);// time in unix;
            const allData = { ...data, postId, createdAt: createdDate, prev: null, next: null };
            const allPosts = await db.posts.find().toArray();
            console.log(allPosts);
            const length = allPosts.length;
            const lastPost = allPosts[length - 1]; // last post

            if (length === 0) {
                console.log("in initial post")

                await db.posts.insertOne(allData);

            }
            if (length !== 0 && lastPost.next === null) {
                console.log("in not equal 0")
                const lastPostId = lastPost.postId; // last or prev post ID;
                let newPostId = genNanoId();

                const postData = req.body;
                const nextPost = {
                    ...postData,
                    postId: newPostId,
                    next: null,
                    createdAt: createdDate,
                    prev: lastPostId

                }

                let postNewData = await db.posts.insertOne(nextPost);

                const updatePost = {
                    ...lastPost,
                    next: newPostId,

                }


                await db.posts.findOneAndUpdate({ postId: lastPostId }, { $set: updatePost }, { ReturnDocument: "after" });


            }
            // const lastPrevPost=allPosts[length-2];// last post before post

            // if (lastPost.prev === null) {
            //     allData
            // }

            // if (lastPost.next === null) {
            //     allData.prev = allPosts[length - 2]._id;
            //     allData.next = null;

            //     await db.posts.insertOne(allData);
            // }
            return res.status(200).send("post created successfully");
        } catch (error) {
            console.log('error', error.message);;
            return res.status(404).send({ Error: error.message })
        }


    },

    //get post by id;

    async getAllPosts(req, res) {
        try {
            console.log("in get all posts");

            const allPosts = await db.posts.find().toArray();
            // console.log("all:", allPosts)
            return res.status(200).send(allPosts);
        } catch (error) {
            console.log(error.message)
            return res.status(400).send({ Error: error.message })
        }
    },

    async getSinglePost(req, res) {
        try {
            console.log("in get post")
            const postId = req.params.id; // id get from url parms ;
            const post = await db.posts.findOne({ postId: postId }); // get post from db;

            res.status(200).send(post);
        } catch (error) {
            console.log('error', error.message);;
            res.status(404).send({ Error: error.message })
        }
    },

    // delete post depend on id;
    async deletePost(req, res) {
        try {
            const postId = req.params.id;
            const post = await db.posts.findOne({ postId: postId });
            const prevPostId = post.prev;
            const nextPostId = post.next;

            await db.posts.delete({ postId: postId });// selected post deleted;
            if (prevPostId !== null) {

                const prevPostDetails = await db.posts.findOne({ postId: prevPostId });
                console.log("prevPost:", prevPostDetails.data);

                const updatedPrevPost = {
                    ...prevPostDetails,
                    next: nextPostId,
                }

                await db.posts.findOneAndUpdate({ postId: prevPostId }, { $set: updatedPrevPost }, { ReturnDocument: "after" })
            }
            else if (nextPostId !== null) {
                const nextPostDetails = await db.posts.findOne({ postId: nextPostId });
                console.log("nextPost Details:", nextPostDetails);
                const updatedNextPost = {
                    ...nextPostDetails,
                    prev: prevPostId,
                }
                await db.posts.findOneAndUpdate({ postId: nextPostId }, { $set: updatedNextPost }, { ReturnDocument: "after" })
            }
            return res.status(200).send("deleted successfully")
        } catch (err) {
            console.log('error', error.message);;
            res.status(404).send({ Error: error.message })
        }
    }
}

module.exports = service;