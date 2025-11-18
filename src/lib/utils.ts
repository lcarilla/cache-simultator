import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AddressFormat = "binary" | "hex" | "decimal";

/**
 * Converts a hex string (with optional 0x prefix) to binary string
 */
export function hexToBinary(hexString: string): string {
  // Remove optional 0x prefix
  const cleanHex = hexString.replace(/^0[xX]/, "");

  // Convert to binary and pad to ensure consistent length
  const decimal = parseInt(cleanHex, 16);
  const binary = decimal.toString(2);

  // Pad to 32 bits to match the expected address length
  return binary.padStart(32, "0");
}

/**
 * Converts a decimal string to binary string
 */
export function decimalToBinary(decimalString: string): string {
  // Convert to binary and pad to ensure consistent length
  const decimal = parseInt(decimalString, 10);
  const binary = decimal.toString(2);

  // Pad to 32 bits to match the expected address length
  return binary.padStart(32, "0");
}

/**
 * Converts a binary string to hex string (always with 0x prefix)
 */
export function binaryToHex(binaryString: string): string {
  // Convert to decimal first, then to hex
  const decimal = parseInt(binaryString, 2);
  const hex = decimal.toString(16).toUpperCase();

  // Always add 0x prefix
  return `0x${hex}`;
}

/**
 * Validates if a string is a valid binary number
 */
export function isValidBinary(binaryString: string): boolean {
  return /^[01]+$/.test(binaryString);
}

/**
 * Validates if a string is a valid hex number (with optional 0x prefix)
 */
export function isValidHex(hexString: string): boolean {
  const cleanHex = hexString.replace(/^0[xX]/, "");
  return /^[0-9a-fA-F]+$/.test(cleanHex);
}

/**
 * Validates if a string is a valid decimal number
 */
export function isValidDecimal(decimalString: string): boolean {
  return /^\d+$/.test(decimalString);
}

/**
 * Formats an address for display based on the selected format
 * Ensures all output is padded to 32 bits (8 hex digits or 32 binary digits)
 */
export function formatAddressForDisplay(
  binaryAddress: string,
  format: AddressFormat
): string {
  // Ensure the binary address is exactly 32 bits
  const paddedBinary = binaryAddress.padStart(32, "0");

  if (format === "hex") {
    const hexValue = binaryToHex(paddedBinary);
    // Extract just the hex digits (remove 0x prefix)
    const hexDigits = hexValue.slice(2);
    // Pad to 8 hex digits
    const paddedHex = hexDigits.padStart(8, "0");
    return `0x${paddedHex}`;
  } else if (format === "decimal") {
    // Convert binary to decimal
    const decimalValue = parseInt(paddedBinary, 2);
    return decimalValue.toString();
  }
  return paddedBinary;
}
