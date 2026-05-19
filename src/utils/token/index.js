import jwt from 'jsonwebtoken';

const SECRET = "asdfhasdjfhkkasdjfasdjfasdf";

export const verifyToken = (token, secretKey = SECRET) => {
  return jwt.verify(token, secretKey);
};

export const generateToken = ({ payload, secretKey = SECRET, options = { expiresIn: "7d" } }) => {
  return jwt.sign(payload, secretKey, options);
};