import bcrypt from 'bcrypt';

export const hashPasword = (password) => {
    return bcrypt.hashSync(password, 10);
}

export const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
}
