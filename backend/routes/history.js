const express = require("express");
const { getHistory } = require("../state/history");
const router = express.Router();
router.get("/", (req, res) => {
  res.json(getHistory());
});
module.exports = router;
