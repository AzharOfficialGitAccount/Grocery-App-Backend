const axios = require('axios');
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
require("dotenv").config();

module.exports = {

  generateOtpWithMSG91: async (obj) => {
    try {
      const options = {
        method: 'GET',
        url: `https://control.msg91.com/api/v5/otp?template_id=${process.env.TEMPLATE_ID}&mobile=${obj.phoneNumber}&otp=${obj.otp}&otp_length=6&otp_expiry=2`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authkey: process.env.AUTH_KEY,
        },
        data: { Param1: 'value1', Param2: 'value2', Param3: 'value3' }
      };

      const response = await axios.request(options);
      if (response.data.type === 'success') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      return false;
    }
  },

  otpGenerate: () => {
    const randomValue = crypto.randomBytes(2).readUInt16LE(0) % 10000;
    const otp = String(randomValue).padStart(4, '0');
    return otp;
  },

  generateAuthJwt: (payload) => {
    const { expiresIn, ...params } = payload;
    const token = jwt.sign(params, process.env.SECRET_KEY, { expiresIn });
    if (!token) {
      return false;
    }
    return token;
  },

}
