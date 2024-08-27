import express from "express"
import { PrismaClient } from "@prisma/client"

import api_keys from "./api_keys"
import { encryptSecret } from "../encryption"

const router = express.Router()
const prisma = new PrismaClient()

router.use("/:user_id/api_keys", api_keys)

router.get("/", async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
})

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

router.put("/:user_id", async (req, res) => {
    // TODO: Get user from API key
    /*
    const user = await prisma.user.update({
        where: { id: parseInt(req.params.user_id) },
        data: {
            name,
            password_digest: 
        }
    })
    res.json(user)
    */
    res.send("WIP")
})

router.delete("/:user_id", async (req, res) => {
    // TODO: Get user from API key
    const user_id = req.params.user_id
    const user = await prisma.user.delete({
        where: { id: parseInt(user_id) }
    })
    res.send(`User ${user_id} deleted`)
})

export default router