import { jwtVerify, createRemoteJWKSet } from 'jose'
 
export async function validateToken(token: string) {
    const JWKS = createRemoteJWKSet(
      new URL('http://localhost:4000/api/auth/jwks')
    )
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'http://localhost:4000', // Should match your JWT issuer which is the BASE_URL
      audience: 'http://localhost:5000', // Should match your JWT audience which is the BASE_URL by default
    })
    return payload
}
