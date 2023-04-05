const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

// generate random private key
const privateKey = secp.utils.randomPrivateKey();
console.log("PRIVATE KEY: ", toHex(privateKey));

// generate public key and get last 20 digit
const getPublicKey = secp.getPublicKey(privateKey);
const address = getPublicKey.slice(1);
console.log("PUBLIC KEY: ", toHex(address.slice(-20)));
// console.log("PUBLIC KEY: ", toHex(publicKey))
