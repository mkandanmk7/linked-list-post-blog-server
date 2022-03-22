const service = require('../services/posts.service');

const ROUTER = require('express').Router();

ROUTER.get("/:id", service.getSinglePost);
ROUTER.post("/", service.createPost);

//single post by id;

module.exports = ROUTER;