const express = require('express');
const router = express.Router();

// Routes and middlewares here
const index = require("../controllers/index");

router.get('/download/:uris', index.getUriData);
router.get('/body/:uris', index.getIndexBody);
router.get('/tag/:uris/:tag', index.getBodyChildTag);
router.get('/tag/depth/:uris/:tag', index.getBodyChildsTag);

module.exports = router;