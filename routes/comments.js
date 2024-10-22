const express = require("express");
const router = express.Router();
const posts = require("../data/posts.js");
const users = require("../data/users.js");
const comments = require("../data/comments.js");
const error = require("../utilities/error.js");

router.get("/", (req, res, next) => {
  if (req.query.userId) {
    const user = users.find((u) => u.id == req.query.userId);
    if (!user) return next(error(400, "Cannot find user"));
    const filteredComments = comments.filter((comment) => {
      return comment.userId == user.id;
    });
    res.json(filteredComments);
  } else if (req.query.postId) {
    const post = posts.find((p) => p.id == req.query.postId);
    if (!post) return next(error(400, "Cannot find post"));
    const filteredComments = comments.filter(
      (comment) => comment.postId == post.id
    );
    res.json(filteredComments);
  } else {
    const links = [
      {
        href: "comments/:id",
        rel: ":id",
        type: "GET",
      },
    ];
    res.json({ comments, links });
  }
});
// Create Comment
router.post("/", (req, res, next) => {
  // Within the POST request route, we create a new
  // comment with the data given by the client.
  if (req.body.userId && req.body.postId && req.body.body) {
    const user = users.find((u) => u.id == req.body.userId);
    if (!user) return next(error(400, "Cannot find user"));
    const post = posts.find((post) => post.id == req.body.postId);
    if (!post) return next(error(400, "Cannot find post"));
    let commentId;
    if (comments.length) {
      commentId = comments[comments.length - 1].id + 1;
    } else {
      commentId = 1;
    }
    const comment = {
      id: commentId,
      userId: req.body.userId,
      postId: req.body.postId,
      body: req.body.body,
    };
    comments.push(comment);
    res.json(comment);
  } else {
    next(error(400, "Insufficient Data"));
  }
});

router.get("/:id", (req, res, next) => {
  const comment = comments.find((c) => req.params.id == c.id);
  if (!comment) return next(error(400, "Cannot find comment"));
  res.json(comment);
});

router.patch("/:id", (req, res, next) => {
  const comment = comments.find((c, i) => {
    if (c.id == req.params.id) {
      // req.body holds the update for the comment
      for (const key in req.body) {
        // applying the req.body keys to the existing comment keys, overwriting them
        comments[i][key] = req.body[key];
      }
      return true;
    }
  });

  if (comment) res.json(comment);
  else next();
});

router.delete("/:id", (req, res, next) => {
  const comment = comments.find((c, i) => {
    if (c.id == req.params.id) {
      comments.splice(i, 1);
      return true;
    }
  });

  if (comment) res.json(comment);
  else next();
});

module.exports = router;
