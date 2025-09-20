import CryptoJS from 'crypto-js';

const getEncryptionKey = () => {
    const secret = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
    if (!secret) {
        // In a real app, you'd want more robust error handling or a fallback.
        // For this environment, we'll log a warning and use a default, less secure key.
        console.warn("ENCRYPTION_SECRET is not set in .env. Using a default key.");
        return 'default-insecure-secret-key-1234';
    }
    return secret;
}

export function encrypt(text: string): string {
    if (!text) return text;
    const key = getEncryptionKey();
    return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext: string): string {
    if (!ciphertext) return ciphertext;
    const key = getEncryptionKey();
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        // If decryption results in an empty string, it might mean the key is wrong
        // or the data was not encrypted. Return the original ciphertext in that case.
        return originalText || ciphertext;
    } catch (error) {
        console.error("Decryption failed:", error);
        // If an error occurs, return the original ciphertext to avoid data loss.
        return ciphertext;
    }
}
