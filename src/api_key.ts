import { randomBytes } from "crypto";

export function generateApiKey() : string
{
    return randomBytes(16).toString("hex")
}