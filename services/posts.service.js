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

    async insertPost(req, res) {
        try {
            const allPosts = await db.posts.find().toArray();
            const length = allPosts.length;
            const insertPosition = req.body.position;
            const prevPostPosition = insertPosition - 1; // get prev post index
            const nextPostPosition = insertPosition // get next post index;
            const prevPostDetails = allPosts[prevPostPosition];
            const nextPostDetails = allPosts[nextPostPosition];
            console.log("prevPost:", prevPostDetails);
            console.log("next Post:", nextPostDetails);
            const postId = genNanoId();
            const createdDate = Math.floor(new Date().getTime() / 1000.0);

            //new post details obj;
            const newPost = {
                ...req.body,
                postId,
                createdAt: createdDate,
                next: nextPostDetails.postId,
                prev: prevPostDetails.postId
            }

            //insert new post at specified position: 
            await db.posts.insertOne(newPost);

            //updated prevPost details obj;
            const updatedPrevPost = {
                ...prevPostDetails,
                next: postId
            }
            await db.posts.findOneAndUpdate({ postId: prevPostDetails.postId }, { $set: updatedPrevPost }, { ReturnDocument: "after" });

            //updated next post details obj;
            const updatedNextPost = {
                ...nextPostDetails,
                prev: postId,
            }
            await db.posts.findOneAndUpdate({ postId: nextPostDetails.postId }, { $set: updatedNextPost }, { ReturnDocument: "after" });


            return res.status(200).send("inserted successfully at specified position")
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
            console.log("in delete Post")
            const postId = req.params.id;
            //get delete post details; we can get deleted post prev and next id's;
            const post = await db.posts.findOne({ postId: postId });
            console.log('post', post)
            const prevPostId = post.prev;  // prev postid
            const nextPostId = post.next;  //next postid

            console.log("deleted")
            if (prevPostId !== null || nextPostId !== null) {
                console.log("in prev post null")
                //prev post next id updation
                const prevPostDetails = await db.posts.findOne({ postId: prevPostId });
                console.log("prevPost:", prevPostDetails);

                const updatedPrevPost = {
                    ...prevPostDetails,
                    next: nextPostId,
                }

                await db.posts.findOneAndUpdate({ postId: prevPostId }, { $set: updatedPrevPost }, { ReturnDocument: "after" })

                // next post prev id updation;
                console.log("in next post updation")
                const nextPostDetails = await db.posts.findOne({ postId: nextPostId });
                console.log("nextPost Details:", nextPostDetails);
                const updatedNextPost = {
                    ...nextPostDetails,
                    prev: prevPostId,
                }
                await db.posts.findOneAndUpdate({ postId: nextPostId }, { $set: updatedNextPost }, { ReturnDocument: "after" })

            }
            //     else if (nextPostId !== null) {
            //     console.log("in next post updation")
            //     const nextPostDetails = await db.posts.findOne({ postId: nextPostId });
            //     console.log("nextPost Details:", nextPostDetails);
            //     const updatedNextPost = {
            //         ...nextPostDetails,
            //         prev: prevPostId,
            //     }
            //     await db.posts.findOneAndUpdate({ postId: nextPostId }, { $set: updatedNextPost }, { ReturnDocument: "after" })
            // }
            else if (nextPostId === null) {
                //prevPost"s next null updation;
                const prevPostDetails = await db.posts.findOne({ postId: prevPostId });
                console.log("prevPost:", prevPostDetails);

                const updatedPrevPost = {
                    ...prevPostDetails,
                    next: null,
                }

                await db.posts.findOneAndUpdate({ postId: prevPostId }, { $set: updatedPrevPost }, { ReturnDocument: "after" })

            }
            else if (prevPostId === null) {
                const nextPostDetails = await db.posts.findOne({ postId: nextPostId });
                console.log("nextPost:", nextPostDetails);

                const updatedNextPost = {
                    ...nextPostDetails,
                    prev: null,
                }

                await db.posts.findOneAndUpdate({ postId: nextPostId }, { $set: updatedNextPost }, { ReturnDocument: "after" })

            }
            await db.posts.deleteOne({ postId: postId });// selected post deleted;
            return res.status(200).send("deleted successfully")
        } catch (error) {
            console.log('error', error.message);;
            res.status(404).send({ Error: error.message })
        }
    }
}

module.exports = service;