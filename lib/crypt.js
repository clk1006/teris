const AesEncryption = require('aes-encryption')

const aes = new AesEncryption();
aes.setSecretKey('6251655468576D597133743677397A24432646294A404E635266556A586E3272')

export function encryptFromJSON(JSONInput) {
    console.log(aes.encrypt(JSON.stringify(JSONInput)))
    console.log(aes.decrypt(aes.encrypt(JSON.stringify(JSONInput))))
    console.log(JSON.stringify(JSONInput))
    return aes.encrypt(JSON.stringify(JSONInput));
}

export function decrypt(input) {
    return aes.decrypt(input)
}