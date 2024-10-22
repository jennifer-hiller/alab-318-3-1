require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const usersRouter = require("./routes/users.js");
const postsRouter = require("./routes/posts.js");
const commentsRouter = require("./routes/comments.js");
const error = require("./utilities/error.js");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

// New logging middleware to help us keep track of
// requests during testing!
app.use((req, res, next) => {
  const time = new Date();

  console.log(
    `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Containing the data:");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});

const apiKeys = process.env["API-KEYS"];

//API-KEY Middleware
// Bouncer
app.use("/api", (req, res, next) => {
  const key = req.query["api-key"];

  // Check for the absence of a key
  if (!key) {
    res.status(400).json({ error: "API Key Required" });
    return;
  }

  // Check for key validity
  if (apiKeys.indexOf(key) === -1) {
    res.status(401).json({ error: "Invalid API Key" });
    return;
  }

  req.key = key;
  next();
});

//Router Set Up
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);

app.get("/users/new", (req, res) => {
  res.send(`
    <div>
      <h1>Create new user</h1>
      <form action="/api/users?api-key=perscholas" method="POST">
        <p>Name: <input type="text" name="name" /></p>
        <p>Username: <input type="text" name="username" /></p>
        <p>Email: <input type="email" name="email" /></p>
        <p><button>Submit</button></p>
      </form>
    </div>  
  `);
});

// Adding some HATEOAS links.
app.get("/", (req, res, next) => {
  res.json({
    links: [
      {
        href: "/api",
        rel: "api",
        type: "GET",
      },
    ],
  });
});

// Adding some HATEOAS links.
app.get("/api", (req, res, next) => {
  res.json({
    links: [
      {
        href: "api/users",
        rel: "users",
        type: "GET",
      },
      {
        href: "api/users",
        rel: "users",
        type: "POST",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "GET",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "POST",
      },
      {
        href: "api/comments",
        rel: "comments",
        type: "GET",
      },
      {
        href: "api/comments",
        rel: "comments",
        type: "POST",
      },
    ],
  });
});

app.get("/", (req, res, next) => {
  res.send("Work in progress!");
});

// 404 Error Handling Middleware
app.use((req, res, next) => {
  next(error(404, "Resource Not Found"));
});

// Custom 404 (not found) middleware.
// Since we place this last, it will only process
// if no other routes have already sent a response!
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
