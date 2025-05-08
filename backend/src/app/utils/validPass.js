 const bcrypt = require('bcrypt');
 const compareValidPass = async (payloadPass, hashedPass) => {
    const isValidPass = await bcrypt.compare(payloadPass, hashedPass);
    return isValidPass;
};

module.exports = compareValidPass;
