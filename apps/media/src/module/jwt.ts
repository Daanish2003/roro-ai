import { jwtVerify, createRemoteJWKSet } from 'jose'
 
export async function validateToken(token: string) {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/jwks`)
    )
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.NEXT_PUBLIC_BACKEND_URL,
      audience: process.env.NEXT_PUBLIC_MEDIA_URL,
    })
    return payload
}
