const express = require("express");
const responses = require("./responses");

const router = express.Router();

router.get("/app", (req, resp) => {
  resp.render("app");
});

module.exports = router;
