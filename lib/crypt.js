const AESEncryption = require('aes-encryption')

const aes = new AESEncryption();
aes.setSecretKey('6251655468576D597133743677397A24432646294A404E635266556A586E3272')

export function encryptFromJSON(JSONInput) {
    return aes.encrypt(JSON.stringify(JSONInput));
}

export function decrypt(input) {
    return aes.decrypt(input)
}