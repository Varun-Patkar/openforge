import crypto from "crypto";

// Use an environment variable for the encryption key
const ENCRYPTION_KEY =
	process.env.ENCRYPTION_KEY || "your-fallback-encryption-key-min-32-chars";

// Encrypt data
export function encrypt(text) {
	// Create an initialization vector
	const iv = crypto.randomBytes(16);
	// Create cipher
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(ENCRYPTION_KEY),
		iv
	);

	// Encrypt the data
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");

	// Return iv + encrypted data (iv is needed for decryption)
	return iv.toString("hex") + ":" + encrypted;
}

// Decrypt data
export function decrypt(encryptedText) {
	// Split the iv and encrypted data
	const textParts = encryptedText.split(":");
	const iv = Buffer.from(textParts[0], "hex");
	const encryptedData = textParts[1];

	// Create decipher
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(ENCRYPTION_KEY),
		iv
	);

	// Decrypt the data
	let decrypted = decipher.update(encryptedData, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}
