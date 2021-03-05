const router = require("express").Router();
const { Comment } = require("../../models");

// get all comments
router.get("/", (req, res) => {
  console.log("==============");
  Comment.findAll({
    attributes: ["id", "comment_text", "user_id", "post_id"],
  })
    .then((dbCommentData) => res.json(dbCommentData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// post comment
router.post("/", (req, res) => {
  if (req.session) {
    Comment.create({
      comment_text: req.body.comment_text,
      post_id: req.body.post_id,
      user_id: req.session.user_id,
    });
    then((dbCommentData) => res.json(dbCommentData)).catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
  }
});

// delete comment
router.delete("/:id", (req, res) => {
  Comment.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbCommentData) => {
      if (!dbCommentData) {
        res.status(404).json({ message: "No comment found with this id" });
        return;
      }
      res.json(dbCommentData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
