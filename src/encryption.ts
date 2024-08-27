import { genSalt, hash, compare } from "bcrypt"

export async function encryptSecret(secret: string) : Promise<string>
{
    const salt = await genSalt(10)
    return await hash(secret, salt)
}

export async function compareSecret(secret: string, encrypted: string) : Promise<boolean>
{
    return await compare(secret, encrypted)
}