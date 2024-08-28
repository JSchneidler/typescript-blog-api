import express, { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"

import comments from "./comments"
import authenticate from "../middleware/authenticate"

const router = express.Router()
const prisma = new PrismaClient()

async function validate_author(req: Request, res: Response, next: NextFunction)
{
    const article = await prisma.article.findFirst({ where: { id: parseInt(req.params.article_id) }})

    if (!article)
        return res.status(404).json({ error: `Article ${req.params.article_id} not found`})

    // @ts-ignore: 401 will already be returned if no user was found
    if (article.author_id != req.user.id)
        // TODO: Allow if admin
        return res.status(403).json({ error: "Insufficient permissions" })

    next()
}

router.use("/:article_id/comments", comments)

router.get("/", async (req, res) => {
    const articles = await prisma.article.findMany({
        include: { author: { select: { id: true, name: true }} }
    })

    res.json(articles)
})

router.get("/:article_id", async (req, res) => {
    const article = await prisma.article.findFirst({
        where: { id: parseInt(req.params.article_id) },
        include: { author: { select: { id: true, name: true }} }
    })

    res.json(article)
})

router.post("/", authenticate, async (req, res) => {
    const { title, body } = req.body
    const article = await prisma.article.create({
        data: {
            title,
            body,
            // @ts-ignore: 401 will already be returned if no user was found
            author_id: req.user.id
        }
    })

    res.json(article)
})

router.put("/:article_id", authenticate, validate_author, async (req, res) => {
    const { title, body } = req.body

    const article = await prisma.article.update({
        where: { id: parseInt(req.params.article_id) },
        data: {
            title,
            body,
        }
    })

    res.json(article)
})

router.delete("/:article_id", authenticate, validate_author, async (req, res) => {
    const article_id = req.params.article_id
    await prisma.user.delete({
        where: { id: parseInt(article_id) }
    })

    res.send(`Article ${article_id} deleted`)
})

export default router