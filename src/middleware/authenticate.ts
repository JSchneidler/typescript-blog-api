import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client"

import { compareSecret } from "../encryption";

const prisma = new PrismaClient()

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export default async function authenticate(req: Request, res: Response, next: NextFunction)
{
    const authHeader = req.headers.authorization
    const isBearer = authHeader?.startsWith("Bearer ")
    const isBasic = authHeader?.startsWith("Basic ")

    if (!authHeader || (!isBearer && !isBasic))
        return res.status(401).json({ error: "Missing or invalid token" })

    const contents = authHeader.substring(authHeader.indexOf(" ") + 1)

    if (isBasic) {
        const b64Decoded = Buffer.from(contents, "base64").toString("utf-8")
        const [ name, password ] = b64Decoded.split(":")
        const user = await prisma.user.findFirst({ where: { name }})

        if (!user)
            return res.status(401).json({ error: "Missing or invalid token" })

        if (await compareSecret(password, user.password_digest)) {
            req.user = user
            return next()
        }

        return res.status(401).json({ error: "Missing or invalid token" })
    } else if (isBearer) {
        const [ user_id, key ] = contents.split(":")

        if (key.length !== 32)
            return res.status(401).json({ error: "Missing or invalid token" })

        const user = await prisma.user.findFirst({ where: {id: parseInt(user_id) }})

        if (!user)
            return res.status(401).json({ error: "Missing or invalid token" })
        
        const api_keys = await prisma.apiKey.findMany({ where: { user_id: user.id } })
        for (const api_key of api_keys) {
            if (await compareSecret(key, api_key.token_digest)) {
                req.user = user
                return next()
            }
        }

        return res.status(401).json({ error: "Missing or invalid token" })
    }

    return next()
}