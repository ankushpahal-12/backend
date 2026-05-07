/**
 * Secrets Manager Utility
 * Secure storage and encryption of sensitive credentials
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecretsManager {
  constructor() {
    this.secrets = {};
    this.encryptionAlgorithm = 'aes-256-gcm';

    // Get encryption key from environment
    this.encryptionKey = process.env.SECRETS_ENCRYPTION_KEY;

    if (!this.encryptionKey) {
      throw new Error(
        'SECRETS_ENCRYPTION_KEY not set. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }

    if (this.encryptionKey.length !== 64) {
      throw new Error('SECRETS_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }

    this.loadSecrets();
  }

  /**
   * Encrypt a sensitive value
   */
  encrypt(value) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.encryptionAlgorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypt a sensitive value
   */
  decrypt(encryptedValue) {
    const parts = encryptedValue.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted value format');
    }

    const [ivHex, encrypted, authTagHex] = parts;

    const decipher = crypto.createDecipheriv(
      this.encryptionAlgorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Store a secret
   */
  setSecret(key, value) {
    if (!key || typeof key !== 'string') {
      throw new Error('Secret key must be a non-empty string');
    }

    this.secrets[key] = {
      value: this.encrypt(value),
      createdAt: new Date().toISOString(),
      rotated: false,
    };

    this.persistSecrets();
    console.log(`[SECRETS] Secret '${key}' stored`);
  }

  /**
   * Retrieve a secret
   */
  getSecret(key) {
    if (!this.secrets[key]) {
      throw new Error(`Secret '${key}' not found`);
    }

    try {
      return this.decrypt(this.secrets[key].value);
    } catch (error) {
      throw new Error(`Failed to decrypt secret '${key}': ${error.message}`);
    }
  }

  /**
   * Check if secret exists
   */
  hasSecret(key) {
    return !!this.secrets[key];
  }

  /**
   * Rotate a secret
   */
  rotateSecret(key, newValue) {
    if (!this.secrets[key]) {
      throw new Error(`Secret '${key}' not found`);
    }

    // Keep old value for verification window
    this.secrets[key].previousValue = this.secrets[key].value;
    this.secrets[key].value = this.encrypt(newValue);
    this.secrets[key].rotated = true;
    this.secrets[key].rotatedAt = new Date().toISOString();

    this.persistSecrets();
    console.log(`[SECRETS] Secret '${key}' rotated`);
  }

  /**
   * Persist secrets to encrypted file
   */
  persistSecrets() {
    const secretsPath = path.join(__dirname, '../../.secrets.enc');

    try {
      fs.writeFileSync(secretsPath, JSON.stringify(this.secrets, null, 2), 'utf8');

      // Restrict file permissions to owner only
      fs.chmodSync(secretsPath, 0o600);
      console.log('[SECRETS] Secrets persisted to disk (chmod 600)');
    } catch (error) {
      console.error('[SECRETS] Failed to persist secrets:', error.message);
      throw error;
    }
  }

  /**
   * Load secrets from encrypted file
   */
  loadSecrets() {
    const secretsPath = path.join(__dirname, '../../.secrets.enc');

    try {
      if (fs.existsSync(secretsPath)) {
        this.secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
        console.log(`[SECRETS] Loaded ${Object.keys(this.secrets).length} secrets`);
      } else {
        console.log('[SECRETS] No secrets file found. Creating new.');
        this.persistSecrets();
      }
    } catch (error) {
      console.error('[SECRETS] Failed to load secrets:', error.message);
      throw error;
    }
  }

  /**
   * Delete a secret
   */
  deleteSecret(key) {
    if (!this.secrets[key]) {
      throw new Error(`Secret '${key}' not found`);
    }

    delete this.secrets[key];
    this.persistSecrets();
    console.log(`[SECRETS] Secret '${key}' deleted`);
  }

  /**
   * Get all secret keys (without values)
   */
  listSecrets() {
    return Object.keys(this.secrets).map((key) => ({
      key,
      createdAt: this.secrets[key].createdAt,
      rotated: this.secrets[key].rotated,
    }));
  }
}

// Create singleton instance
const secretsManager = new SecretsManager();

export default secretsManager;
