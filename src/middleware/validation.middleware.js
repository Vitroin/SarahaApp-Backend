import joi from "joi";

export const isValid = ( schema ) => {
    return ( req, res, next ) =>{
        const { value,error} = schema.validate( req.body, { abortEarly: false});
        if ( error ){
            let errMessages = error.details.map((error) => error.message);
            console.log(errMessages)
            errMessages = errMessages.join(", ");
            throw new  Error(errMessages, { cause: 400 });
        }
        next();
    }
}

export const generalFields = {
    email: joi.string().email(),
    phoneNumber: joi.string().length(11),
    password: joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    dob: joi.date(),
    fullName: joi.string().min(3).max(30),
    otp: joi.string().length(5),
    rePassword: (ref)=> joi.string().valid(joi.ref(ref)),
}

