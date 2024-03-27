import bcrypt from 'bcryptjs';

const helpers = {};

helpers.encryptPass = async (pass) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    return hash;
};

helpers.matchPass = async (pass, dbPass) => {
    try {
        return await bcrypt.compare(pass, dbPass);
    } catch (error) {
        console.log(error);
    };
};

export default helpers;