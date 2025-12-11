const keytar = require('keytar');
const SERVICE = 'ElectronAppAuth';
const ACCOUNT = 'RefreshToken';


async function saveRefreshToken(token) {
await keytar.setPassword(SERVICE, ACCOUNT, token);
}
async function getRefreshToken() {
return await keytar.getPassword(SERVICE, ACCOUNT);
}
async function clearTokens() {
await keytar.deletePassword(SERVICE, ACCOUNT);
}


module.exports = { saveRefreshToken, getRefreshToken, clearTokens };