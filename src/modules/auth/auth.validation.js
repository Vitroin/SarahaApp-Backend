import joi from 'joi';
import { generalFields } from '../../middleware/validation.middleware.js';

export const registerSchema = joi.object({
    fullName: generalFields.fullName.required(),
    email: generalFields.email.when("phoneNumber", {
        is: joi.exist(),
        then: joi.optional(),
        otherwise: joi.required()
    }),
    phoneNumber: generalFields.phoneNumber,
    password: generalFields.password.required(),
    dob: generalFields.dob
}).or("email", "phoneNumber");

export const loginSchema = joi.object({
    email: generalFields.email.when("phoneNumber", {
        is: joi.exist(),
        then: joi.optional(),
        otherwise: joi.required()
    }),
    phoneNumber: generalFields.phoneNumber,
    password: generalFields.password.required()
}).or("email", "phoneNumber");

export const resetPasswordSchema = joi.object({
    email: generalFields.email.required(),
    newPassword: generalFields.password.required(),
    rePassword: generalFields.rePassword("newPassword").required(),
    otp: generalFields.otp.required()
});