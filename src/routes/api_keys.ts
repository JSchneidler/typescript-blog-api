import express from "express"
import { PrismaClient } from "@prisma/client"

import authenticate from "../authenticate"
import { generateApiKey } from "../api_key"
import { encryptSecret } from "../encryption"

const router = express.Router({ mergeParams: true })
const prisma = new PrismaClient()

// TODO: Check authed user is same as requested user, unless admin

router.get("/", authenticate, async (req, res) => {
    // @ts-ignore: 401 will already be returned if no user found
    if (parseInt(req.params.user_id) != req.user.id) {
        res.status(401)
    }

    // @ts-ignore: 401 will already be returned if no user found
    const api_keys = await prisma.apiKey.findMany({ where: { user_id: req.user.id }})
    res.json(api_keys)
})

router.get("/:api_key_id", authenticate, async (req, res) => {
    const api_key = await prisma.apiKey.findFirstOrThrow({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: parseInt(req.params.api_key_id), user_id: req.user.id }
    })
    res.json(api_key)
})

router.post("/", authenticate, async (req, res) => {
    const api_key_unencrypted = generateApiKey()
    const api_key_encrypted = await encryptSecret(api_key_unencrypted)

    const user = await prisma.user.findFirstOrThrow({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: req.user.id }
    })

    const api_key = await prisma.apiKey.create({
        data: { user_id: user.id, token_digest: api_key_encrypted }
    })
    res.json({
        id: api_key.id,
        key: api_key_unencrypted
    })
})

router.delete("/:api_key_id", authenticate, async (req, res) => {
    const api_key_id = req.params.api_key_id
    await prisma.apiKey.delete({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: parseInt(api_key_id), user_id: req.user.id }
    })
    res.send(`API key ${api_key_id} deleted`)
})

export default router