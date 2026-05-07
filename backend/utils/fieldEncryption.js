/**
 * Field Encryption Utility
 * Encrypt/decrypt sensitive database fields
 */

const crypto = require('crypto');

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

class FieldEncryption {
  constructor() {
    this.encryptionKey = process.env.DB_ENCRYPTION_KEY;

    if (!this.encryptionKey) {
      throw new Error(
        'DB_ENCRYPTION_KEY not set. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }

    if (this.encryptionKey.length !== 64) {
      throw new Error('DB_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
  }

  /**
   * Encrypt plaintext field
   */
  encrypt(plaintext) {
    if (!plaintext) return null;

    if (typeof plaintext !== 'string') {
      plaintext = JSON.stringify(plaintext);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypt encrypted field
   */
  decrypt(encryptedData) {
    if (!encryptedData) return null;

    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted field format');
    }

    const [ivHex, encrypted, authTagHex] = parts;

    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash a field for comparison
   * Use for storing non-decryptable hashes (like last 4 digits)
   */
  hash(value) {
    if (!value) return null;

    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }

  /**
   * Validate encrypted field integrity
   */
  validateIntegrity(encryptedData) {
    if (!encryptedData) return true;

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) return false;

      // Try to decrypt to verify
      this.decrypt(encryptedData);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const fieldEncryption = new FieldEncryption();

module.exports = fieldEncryption;
