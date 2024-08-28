import { Request, Response, NextFunction } from "express";

export default async function validate_user(req: Request, res: Response, next: NextFunction)
{
    // TODO: Allow if admin

    // @ts-ignore: 401 will already be returned if no user was found
    if (parseInt(req.params.user_id) != req.user.id)
        return res.status(403).json({ error: "Insufficient permissions" })

    next()
}