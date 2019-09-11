// load Joi module
const Joi = require('joi');

// accepts name only as letters and converts to uppercase
const name = Joi.string().regex(/^[A-Z]+$/).uppercase();

// accepts only valid lowercase email addresses
const email = Joi.string().email().lowercase().required();

// accepts alphanumeric strings at least 7 characters long
const password = Joi.string().min(7).alphanum().required();

//candidate Registration Schema

const authSchema = Joi.object().keys({
    username : email,
    password : password
});

const resetPasswordSchema = Joi.object().keys({
    oldPassword : password,
    newPassword : password
});


//export the module
module.exports = {
   '/login/:userType' :  authSchema,
   '/register/:userType' :  authSchema,
   '/reset-password/:userType/:resetToken' :  resetPasswordSchema
}