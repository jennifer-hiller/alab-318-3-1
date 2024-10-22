const express = require("express");
const router = express.Router();
const posts = require("../data/posts.js");
const users = require("../data/users.js");
const comments = require("../data/comments.js");
const error = require("../utilities/error.js");

//////////////POSTS//////////////
router.get("/", (req, res, next) => {
  if (req.query.userId) {
    const user = users.find((u) => u.id == req.query.userId);
    if (!user) next();
    const filteredPosts = posts.filter((post) => {
      return post.userId == user.id;
    });
    res.json(filteredPosts);
  } else {
    const links = [
      {
        href: "posts/:id",
        rel: ":id",
        type: "GET",
      },
    ];
    res.json({ posts, links });
  }
});

router.get("/:id", (req, res, next) => {
  const post = posts.find((p) => p.id == req.params.id);

  const links = [
    {
      href: `/${req.params.id}`,
      rel: "",
      type: "PATCH",
    },
    {
      href: `/${req.params.id}`,
      rel: "",
      type: "DELETE",
    },
  ];

  if (post) res.json({ post, links });
  else next();
});

// Create Post
router.post("/", (req, res, next) => {
  // Within the POST request route, we create a new
  // post with the data given by the client.
  // We should also do some more robust validation here,
  // but this is just an example for now.
  if (req.body.userId && req.body.title && req.body.content) {
    const post = {
      id: posts[posts.length - 1].id + 1,
      userId: req.body.userId,
      title: req.body.title,
      content: req.body.content,
    };

    posts.push(post);
    res.json(post);
  } else {
    next(error(400, "Insufficient Data"));
  }
});

//Update a Post
router.patch("/:id", (req, res, next) => {
  // Within the PATCH request route, we allow the client
  // to make changes to an existing post in the database.
  const post = posts.find((p, i) => {
    if (p.id == req.params.id) {
      // req.body holds the update for the user
      for (const key in req.body) {
        // applying the req.body keys to the existing user keys, overwriting them
        posts[i][key] = req.body[key];
      }
      return true;
    }
  });

  if (post) res.json(post);
  else next();
});

router.delete("/:id", (req, res, next) => {
  const user = users.find((u) => u.id == req.params.id);

  const post = posts.find((p, i) => {
    if (p.id == req.params.id) {
      posts.splice(i, 1);
      return true;
    }
  });

  if (post) res.json(post);
  else next();
});

router.get("/:id/comments", (req, res, next) => {
  const post = posts.find((p) => p.id == req.params.id);
  if (!post) return next(error(400, "Post not found"));
  let filteredComments;
  if (req.query.userId) {
    const user = users.find((u) => u.id == req.query.userId);
    if (!user) return next(error(400, "User not found"));
    filteredComments = comments.filter(
      (c) => c.postId == req.params.id && c.userId == req.query.userId
    );
  } else {
    filteredComments = comments.filter((c) => c.postId == req.params.id);
  }
  res.json(filteredComments);
});

module.exports = router;
