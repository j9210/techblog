const router = require("express").Router();
const sequelize = require("express").Router();
const { isContext } = require("vm");
const { Post, User, Comment, Vote } = require("../../models");
const withAuth = require("../../utils/auth");

// GET ALL POSTS
router.get("/", (req, res) => {
  Post.findAll({
    attributes: [
      "id",
      "post_url",
      "title",
      "created_at",
      "post_content",
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)"
        ),
        "vote_count",
      ],
    ],
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        // link tables
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

//GET A SINGLE POST BY ID
router.get('/:id', (req, res) => {
  Post.findOne({
      where: {
          id: req.params.id
      },
      attributes: ['id', 'post_url', 'title', 'created_at', [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
      include: [
          {
              model: Comment,
              attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
              include: {
                model: User,
                attributes: ['username']
              }           
          },
          {
              model: User,
              attributes: ['username']
          }
      ]
  })
    .then(dbPostData => {
        if (!dbPostData) {
            res.json(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData)
    })
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      });
});

// CREATE A POST
router.post('/', (req, res) => {
  Post.create({
      title: req.body.title,
      post_url: req.body.post_url,
      post_content: req.body.post_content,
      user_id: req.session.user_id
  }).then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// UPVOTE POST
router.put('/upvote', (req, res) => {
  // make sure the session exists first
  if (req.session) {
    // pass session id along with all destructured properties on req.body
    Post.upvote({ ...req.body, user_id: req.session.user_id }, { Vote, Comment, User })
      .then(updatedVoteData => res.json(updatedVoteData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

// UPDATE POST BY ID
router.put('/:id',  (req, res) => {
  Post.update(
      {
          title: req.body.title,
          post_content: req.body.post_content
      },
      {
          where: {
              id: req.params.id
          }
      }
  ).then(dbPostData => {
      if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' })
          return;
      }
      res.json(dbPostData);
  }).catch(err => {
      console.log(err);
      res.status(500).json(err)
  });
});

// DELETE A POST BY ID
router.delete("/:id", withAuth, (req, res) => {
  console.log("id", req.params.id);
  Post.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
