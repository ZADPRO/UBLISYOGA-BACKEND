import * as Joi from "joi";

export default {
  userLogin: {
    payload: Joi.object({
      // PAYLOAD DATA
      user_id: Joi.string().required(),
      password: Joi.string().required(),
      domain: Joi.string().optional(),
    }),
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(),
  },
  userSignUp: {
    payload: Joi.object({
      temp_su_email: Joi.string().email().required(),
      temp_su_password: Joi.string().required(),
      domain: Joi.string().optional(),
      temp_su_fname: Joi.string().required(),
      middleName: Joi.string().optional(),
      temp_su_lname: Joi.string().required(),
      temp_su_dob: Joi.string().required(),
      temp_su_mobile: Joi.string().required(),
    }),
    // headers: Joi.object({
    //   authorization: Joi.string().required(),
    //   domain_code: Joi.string().required(),
    // }).unknown(),
  },
};
