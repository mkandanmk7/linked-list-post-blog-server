const { Router } = require('express');
const service = require('../services/posts.service');

const ROUTER = require('express').Router();

ROUTER.get("/:id", service.getSinglePost);
ROUTER.post("/", service.createPost);
ROUTER.get("/allposts", service.getAllPosts);
ROUTER.delete("/:id", service.deletePost)

//single post by id;

module.exports = ROUTER;