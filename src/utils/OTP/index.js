/**
 * 
 * @param {int} expireTime - in minutes
 * @returns object { otp, otpExpire }
 */
export const generateOTP = (expireTime) => { 
    const otp = Math.floor(Math.random() * 90000 + 10000);
    const otpExpire = Date.now() + expireTime * 60 * 1000;
    return { otp, otpExpire };
}