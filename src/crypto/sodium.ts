import * as sodium from 'libsodium-wrappers'

export async function initCrypto() {
    await sodium.ready
    return sodium
}

export function generateKeyPair(sodium: typeof import('libsodium-wrappers')) {
    return sodium.crypto_box_keypair()
}

export function encryptMessage(
    sodium: typeof import('libsodium-wrappers'),
    message: string,
    nonce: Uint8Array,
    receiverPublicKey: Uint8Array,
    senderPrivateKey: Uint8Array
) {
    return sodium.crypto_box_easy(
        sodium.from_string(message),
        nonce,
        receiverPublicKey,
        senderPrivateKey
    )
}

export function decryptMessage(
    sodium: typeof import('libsodium-wrappers'),
    encrypted: Uint8Array,
    nonce: Uint8Array,
    senderPublicKey: Uint8Array,
    receiverPrivateKey: Uint8Array
) {
    const decrypted = sodium.crypto_box_open_easy(
        encrypted,
        nonce,
        senderPublicKey,
        receiverPrivateKey
    )
    return sodium.to_string(decrypted)
}
