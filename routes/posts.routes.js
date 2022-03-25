const { Router } = require('express');
const service = require('../services/posts.service');

const ROUTER = require('express').Router();

ROUTER.post("/", service.createPost);
ROUTER.post("/insert", service.insertPost);
ROUTER.get("/allposts", service.getAllPosts);
ROUTER.delete("/:id", service.deletePost)
ROUTER.get("/:id", service.getSinglePost);

//single post by id;

module.exports = ROUTER;