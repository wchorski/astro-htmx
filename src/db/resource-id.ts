/**
 * Opinionated helpers for generating opaque, prefix-scoped resource IDs.
 *
 * Each ID encodes a UUIDv7, encrypted with AES-256-ECB using a key derived
 * from its prefix, and is exported in a bs58 string of the form
 * `<prefix>_<encodedPayload>`. This provides lightweight obfuscation that is
 * deterministic per prefix.
 *
 * Checkout the Youtube video explaining the design:
 * https://youtu.be/wkwcOCCh6Ic
 *
 */

import { customType } from "drizzle-orm/mysql-core";
import bs58 from "bs58";
import { createCipheriv, createDecipheriv, createHash } from "node:crypto";
import { v7 as uuidv7 } from "uuid";

/** Template literal type for strongly typed prefixed IDs. */
type PrefixedId<Prefix extends string> = `${Prefix}_${string}`;

/** Size, in bytes, of UUIDv7 / AES block handled by this module. */
const BLOCK_SIZE = 16;

/**
 * Deterministically derive a 32-byte AES key from the supplied prefix and secret.
 * @param prefix Prefix namespace for the resource type.
 * @returns Derived AES key material.
 */
const deriveKey = (prefix: string): Buffer =>
  createHash("sha256")
    .update(`resource-id:${prefix}:${process.env.DATABASE_ID_SECRET!}`)
    .digest();

/**
 * Convert raw UUID bytes into the public-facing prefixed identifier.
 * @param prefix Prefix namespace for the resource type.
 * @param internal Raw UUID bytes to encode.
 * @returns Prefixed identifier string.
 */
const encodeId = <Prefix extends string>(
  prefix: Prefix,
  internal: Uint8Array,
): PrefixedId<Prefix> => {
  // Validate input length
  if (internal.length !== BLOCK_SIZE) {
    throw new TypeError(
      `Expected ${BLOCK_SIZE} bytes, received ${internal.length} bytes`,
    );
  }

  // Encrypt the payload
  const cipher = createCipheriv("aes-256-ecb", deriveKey(prefix), null);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(internal), cipher.final()]);

  // Encode as base58 with prefix
  return `${prefix}_${bs58.encode(new Uint8Array(encrypted))}`;
};

/**
 * Decode/verify a prefixed identifier back into its raw UUID bytes.
 * @param prefix Prefix namespace for the resource type.
 * @param external Prefixed identifier to decode.
 * @returns Decrypted UUID bytes.
 * @throws {TypeError} when the string does not start with the expected prefix.
 */
const decodeId = <Prefix extends string>(
  prefix: Prefix,
  external: PrefixedId<Prefix>,
): Uint8Array => {
  // Validate prefix
  if (!external.startsWith(`${prefix}_`)) {
    throw new TypeError(
      `Expected resource ID to start with prefix "${prefix}_"`,
    );
  }

  // Decode the base58 payload
  const encoded = external.slice(prefix.length + 1 /* underscore */);
  const obfuscated = bs58.decode(encoded);

  // Validate decoded length
  if (obfuscated.length !== BLOCK_SIZE) {
    throw new TypeError(
      `Expected ${BLOCK_SIZE} bytes, received ${obfuscated.length} bytes`,
    );
  }

  // Decrypt the payload
  const decipher = createDecipheriv("aes-256-ecb", deriveKey(prefix), null);
  decipher.setAutoPadding(false);
  const decrypted = Buffer.concat([
    decipher.update(obfuscated),
    decipher.final(),
  ]);

  // Return the decrypted UUID bytes
  return new Uint8Array(decrypted);
};

/**
 * Create a new obfuscated resource ID for the provided prefix.
 *
 * @example
 *   const id = generateResourceId("user"); // => "user_3YQ..."
 * @param prefix Prefix namespace for the resource type.
 * @returns Prefixed identifier ready for public exposure.
 */
export const generateResourceId = <Prefix extends string>(
  prefix: Prefix,
): PrefixedId<Prefix> => {
  const bytes = new Uint8Array(16);
  uuidv7(undefined, bytes);
  return encodeId(prefix, bytes);
};

/**
 * Drizzle custom type helper that maps prefixed IDs to binary(16) columns.
 * The column exposes the friendly prefixed string in application code while
 * persisting the raw UUID bytes, and it automatically generates new values via
 * {@link generateResourceId} when inserting rows.
 * @param prefix Prefix namespace for the resource type.
 * @returns Drizzle custom column definition with default value wiring.
 */
export const resourceId = <Name extends string, Prefix extends string>(
  prefix: Prefix,
  dbName?: Name,
) =>
  customType<{
    data: PrefixedId<Prefix> /** User-facing prefixed identifier (e.g. `user_3YQ...`). */;
    driverData: Uint8Array /** Raw UUIDv7 bytes persisted in the database. */;
  }>({
    dataType: () => "binary(16)",
    fromDriver: (internal) => encodeId(prefix, internal),
    toDriver: (external) => decodeId(prefix, external),
  })<Name>(dbName!).$defaultFn(() => generateResourceId(prefix));
