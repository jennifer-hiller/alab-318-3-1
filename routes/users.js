const express = require("express");
const router = express.Router();
const users = require("../data/users.js");
const posts = require("../data/posts.js");
const comments = require("../data/comments.js");
const error = require("../utilities/error.js");

// BASE PATH FOR THIS ROUTER IS: /api/users

//////////////USERS//////////////
// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get("/", (req, res, next) => {
  const links = [
    {
      href: "users/:id",
      rel: ":id",
      type: "GET",
    },
  ];

  res.json({ users, links });
});

// Creating a simple GET route for individual users,
// using a route parameter for the unique id.
router.get("/:id", (req, res, next) => {
  const user = users.find((u) => u.id == req.params.id);
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

  if (user) res.json({ user, links });
  else next();
});

// Create User
router.post("/", (req, res, next) => {
  // Within the POST request route, we create a new
  // user with the data given by the client.
  // We should also do some more robust validation here,
  // but this is just an example for now.
  if (req.body.name && req.body.username && req.body.email) {
    const foundUser = users.find((u) => u.username === req.body.username);
    if (foundUser) {
      return next(error(400, "Username Already Taken"));
    }

    const user = {
      id: users[users.length - 1].id + 1,
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
    };

    users.push(user);
    res.json(user);
  } else {
    next(error(400, "Insufficient Data"));
  }
});

router.patch("/:id", (req, res, next) => {
  // Within the PATCH request route, we allow the client
  // to make changes to an existing user in the database.
  const user = users.find((u, i) => {
    if (u.id == req.params.id) {
      // req.body holds the update for the user
      for (const key in req.body) {
        // applying the req.body keys to the existing user keys, overwriting them
        users[i][key] = req.body[key];
      }
      return true;
    }
  });

  if (user) res.json(user);
  else next();
});

router.delete("/:id", (req, res, next) => {
  // const user = user.find((u, i) => {
  //   if (u.id == req.params.id) {
  //     users.splice(i, 1)
  //      return true
  //   }
  // })

  const userIndex = users.findIndex((u) => u.id == req.params.id);

  if (userIndex !== -1) {
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    res.json(deletedUser);
  } else {
    next();
  }
});

router.get("/:id/posts", (req, res, next) => {
  const user = users.find((u) => u.id == req.params.id);
  if (user) {
    const filteredPosts = posts.filter((post) => {
      return post.userId == user.id;
    });
    res.json(filteredPosts);
  } else next();
});

router.get("/:id/comments", (req, res, next) => {
  const user = users.find((u) => u.id == req.params.id);
  if (!user) return next(error(400, "User not found"));
  let filteredComments;
  if (req.query.postId) {
    const post = posts.find((p) => p.id == req.query.postId);
    if (!post) return next(error(400, "Post not found"));
    filteredComments = comments.filter(
      (c) => c.userId == req.params.id && c.postId == req.query.postId
    );
  } else {
    filteredComments = comments.filter((c) => c.userId == req.params.id);
  }
  res.json(filteredComments);
});

module.exports = router;
