import express from "express"
import session from "express-session"

const app = express()
const port = process.env.PORT || 3000

// view engine setup
app.set("views", "views")
app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))

app.use(session({
  secret: "your-secret-key",  // Replace with a secure key
  resave: false,              // Prevents resaving the session if not modified
  saveUninitialized: true,    // Forces a session that is uninitialized to be saved
  cookie: { maxAge: 60000 },
}))

// Initialize session blogs array
app.use((req, res, next) => {
  if (!req.session.blogs) {
    req.session.blogs = []
  }
  next()
})

const urlSlugFormatter = (url) => {
  return url
  .replace(/[^\w\s]/g, "")
  .split(" ")
  .filter(word => word)
  .join("-")
  .toLowerCase()
}

// app.get("/update-post/:id", (req, res) => {
//   const dataToUpdate = {
//     id: Number(req.params.id),
//     title: req.body.title,
//     content: req.body.content,
//     slug: req.params.slug,
//   }
//
//   const post = req.session.blogs.find(post => post.id === dataToUpdate.id)
//
//   if (post) {
//     post.title = dataToUpdate.title
//     post.content = dataToUpdate.content
//
//     res.render("edit", { post: dataToUpdate })
//   } else {
//     res.status(404).render("error", { message: "Post not found" })
//   }
// })

// GET route to show the edit form
app.get("/post/:id/edit", (req, res) => {
  const post = req.session.blogs.find(post => post.id === Number(req.params.id))

  if (!post) {
    return res.status(404).send("Post not found")
  }

  res.render("edit", { post: post })
})

// POST route to handle the EDIT form submission
app.post("/post/:id", (req, res) => {
  const id = Number(req.params.id)
  const { title, content } = req.body

  const post = req.session.blogs.find(post => post.id === id)

  if (post) {
    post.title = title
    post.content = content

    res.redirect("/")
  } else {
    res.status(404).send("Post not found")
  }
})

app.post("/delete-post/:id", (req, res) => {
  const id = Number(req.params.id)

  req.session.blogs = req.session.blogs.filter(post => post.id !== id)

  res.redirect("/")
})

app.get("/post/:slug", (req, res) => {
  const slug = req.params.slug

  const post = req.session.blogs.find(post => post.urlSlug === slug)

  if (post) {
    res.render("post", { post: post })
  } else {
    res.status(404).render("error", { message: "Blog post not found" })
  }
})

app.post("/create-post", (req, res) => {
  const post = {
    id: Date.now(),
    title: req.body["title"],
    content: req.body["content"],
    urlSlug: urlSlugFormatter(req.body["title"]),
  }

  req.session.blogs.push(post)

  res.redirect("/")
})

app.get("/", (req, res) => {
  res.render("index", { blogs: req.session.blogs })
})

app.listen(port, () => {
  console.log("Listening on port " + port)
})