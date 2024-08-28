import express, { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"

import authenticate from "../middleware/authenticate"

const router = express.Router({ mergeParams: true })
const prisma = new PrismaClient()

async function validate_author(req: Request, res: Response, next: NextFunction)
{
    const comment = await prisma.comment.findFirst({ where: { id: parseInt(req.params.comment_id) }})

    if (!comment)
        return res.status(404).json({ error: `Comment ${req.params.comment_id} not found`})

    // @ts-ignore: 401 will already be returned if no user was found
    if (comment.author_id != req.user.id)
        // TODO: Allow if admin
        return res.status(403).json({ error: "Insufficient permissions" })

    next()
}

router.get("/", async (req, res) => {
    const comments = await prisma.comment.findMany({
        include: { author: { select: { id: true, name: true }} }
    })
    res.json(comments)
})

router.get("/:comment_id", async (req, res) => {
    const comment = await prisma.comment.findFirst({
        where: { id: parseInt(req.params.comment_id) },
        include: { author: { select: { id: true, name: true }} }
    })
    res.json(comment)
})

router.post("/", authenticate, async (req, res) => {
    const { body } = req.body
    const comment = await prisma.comment.create({
        data: {
            body,
            article_id: parseInt(req.params.article_id),
            // @ts-ignore: 401 will already be returned if no user was found
            author_id: req.user.id
        }
    })

    res.json(comment)
})

router.put("/:comment_id", authenticate, validate_author, async (req, res) => {
    const { body } = req.body
    const comment = await prisma.comment.update({
        where: { id: parseInt(req.params.comment_id) },
        data: { body }
    })

    res.json(comment)
})

router.delete("/:comment_id", authenticate, validate_author, async (req, res) => {
    const comment_id = req.params.comment_id
    await prisma.comment.delete({
        where: { id: parseInt(comment_id) }
    })

    res.send(`Comment ${comment_id} deleted`)
})

export default router