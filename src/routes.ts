import express from "express"

import users from "./routes/users"
import articles from "./routes/articles"

const router = express.Router()

router.use("/users", users)
router.use("/articles", articles)

export default router