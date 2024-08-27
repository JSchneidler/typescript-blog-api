import express from "express"
import { PrismaClient } from "@prisma/client"

const router = express.Router({ mergeParams: true })
const prisma = new PrismaClient()

router.get("/", async (req, res) => {
    const comments = await prisma.comment.findMany({
        include: { author: true }
    })
    res.json(comments)
})

router.get("/:comment_id", async (req, res) => {
    const comment = await prisma.comment.findFirstOrThrow({
        where: { id: parseInt(req.params.comment_id) }
    })
    res.json(comment)
})

router.post("/", async (req, res) => {
    // TODO: Get user from API key
    const { title, body } = req.body
    /*
    const comment = await prisma.comment.create({
        data: { body, article: article_id, author: author_id }
    })
    res.json(comment)
    */
    res.send("WIP")
})

router.put("/:comment_id", async (req, res) => {
    // TODO: Get user from API key
    const { title, body } = req.body
    const comment = await prisma.comment.update({
        where: { id: parseInt(req.params.comment_id) },
        data: { body }
    })
    res.json(comment)
})

router.delete("/:comment_id", async (req, res) => {
    // TODO: Get user from API key
    const comment_id = req.params.comment_id
    const comment = await prisma.comment.delete({
        where: { id: parseInt(comment_id) }
    })
    res.send(`Comment ${comment_id} deleted`)
})

export default router