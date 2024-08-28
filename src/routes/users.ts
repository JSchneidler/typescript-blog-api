import express from "express"
import { PrismaClient } from "@prisma/client"

import api_keys from "./api_keys"
import { encryptSecret } from "../encryption"
import authenticate from "../middleware/authenticate"
import validate_user from "../middleware/same_user"

const router = express.Router()
const prisma = new PrismaClient()

router.use("/:user_id/api_keys", api_keys)

// TODO: Admin only?
router.get("/", async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
})

// TODO: Admin/self only?
router.get("/:user_id", async (req, res) => {
    const users = await prisma.user.findFirstOrThrow({
        where: { id: parseInt(req.params.user_id) }
    })
    res.json(users)
})

router.post("/", async (req, res) => {
    const { name, password } = req.body
    const password_encrypted = await encryptSecret(password)

    const user = await prisma.user.create({
        data: {
            name,
            password_digest: password_encrypted
        }
    })
    res.json(user)
})

router.put("/:user_id", authenticate, validate_user, async (req, res) => {
    const { name, password } = req.body

    const user = await prisma.user.update({
        // @ts-ignore: 401 will already be returned if no user found
        where: { id: req.user.id },
        data: {
            name,
            password_digest: await encryptSecret(password)
        }
    })

    res.json(user)
})

router.delete("/:user_id", authenticate, validate_user, async (req, res) => {
    // @ts-ignore: 401 will already be returned if no user found
    const user_id = req.user.id

    await prisma.user.delete({
        where: { id: user_id }
    })

    res.send(`User ${user_id} deleted`)
})

export default router