import jwt from 'jsonwebtoken'

export const verifyToken = (token , secretKey="asdfhasdjfhkkasdjfasdjfasdf") =>{
    return jwt.verify(token,secretKey)
}

export const generateToken = (
{   payload,
    secretKey= "asdfhasdjfhkkasdjfasdjfasdf",
    options = { expiresIn: "15m" }
})=> {
    return jwt.sign(payload, secretKey, options)
}