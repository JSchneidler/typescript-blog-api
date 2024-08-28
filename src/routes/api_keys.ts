import express from "express"
import { PrismaClient } from "@prisma/client"

import { generateApiKey } from "../api_key"
import { encryptSecret } from "../encryption"
import authenticate from "../middleware/authenticate"
import same_user from "../middleware/same_user"

const router = express.Router({ mergeParams: true })
const prisma = new PrismaClient()

router.get("/", authenticate, same_user, async (req, res) => {
    // @ts-ignore: 401 will already be returned if no user found
    const api_keys = await prisma.apiKey.findMany({ where: { user_id: req.user.id }})
    res.json(api_keys)
})

router.get("/:api_key_id", authenticate, same_user, async (req, res) => {
    const api_key = await prisma.apiKey.findFirst({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: parseInt(req.params.api_key_id), user_id: req.user.id }
    })

    if (!api_key)
        return res.status(404).json({ error: `API key ${req.params.api_key_id} not found`})
    
    res.json(api_key)
})

router.post("/", authenticate, same_user, async (req, res) => {
    const api_key_unencrypted = generateApiKey()
    const api_key_encrypted = await encryptSecret(api_key_unencrypted)

    const user = await prisma.user.findFirst({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: req.user.id }
    })

    if (!user)
        return res.status(404).json({ error: `User ${req.params.user_id} not found`})

    const api_key = await prisma.apiKey.create({
        data: { user_id: user.id, token_digest: api_key_encrypted }
    })
    res.json({
        id: api_key.id,
        key: api_key_unencrypted
    })
})

router.delete("/:api_key_id", authenticate, same_user, async (req, res) => {
    const api_key_id = req.params.api_key_id
    const api_key = await prisma.apiKey.delete({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: parseInt(api_key_id), user_id: req.user.id }
    })

    if (!api_key)
        return res.status(404).json({ error: `API key ${req.params.api_key_id} not found`})

    res.send(`API key ${api_key_id} deleted`)
})

export default router