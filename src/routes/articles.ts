import express from "express"
import { PrismaClient } from "@prisma/client"

import comments from "./comments"

const router = express.Router()
const prisma = new PrismaClient()

router.use("/:user_id/comments", comments)

router.get("/", async (req, res) => {
    const articles = await prisma.article.findMany({
        include: { author: true }
    })
    res.json(articles)
})

router.get("/:article_id", async (req, res) => {
    const article = await prisma.article.findFirstOrThrow({
        where: { id: parseInt(req.params.article_id) }
    })
    res.json(article)
})

router.post("/", async (req, res) => {
    // TODO: Get user from API key
    const { title, body } = req.body
    /*
    const article = await prisma.article.create({
        data: {
            title,
            body,
            author: user.id
        }
    })
    res.json(article)
    */
    res.send("WIP")
})

router.put("/:article_id", async (req, res) => {
    // TODO: Get user from API key
    const { title, body } = req.body
    const article = await prisma.article.update({
        where: { id: parseInt(req.params.article_id) },
        data: {
            title,
            body
        }
    })
    res.json(article)
})

router.delete("/:article_id", async (req, res) => {
    // TODO: Get user from API key
    const article_id = req.params.article_id
    const article = await prisma.user.delete({
        where: { id: parseInt(article_id) }
    })
    res.send(`Article ${article_id} deleted`)
})

export default router