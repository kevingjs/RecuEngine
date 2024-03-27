import { customAlphabet } from 'nanoid/async';

/**
 * @param {number} length 
 * @returns {string}
 */
const code = async (length, alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
	const uid = await customAlphabet(alphabet, length)();
	return uid;
};

export default code;