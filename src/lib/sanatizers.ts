// phoneSanitizer.ts

export interface SanitizationResult {
  valid: string[];
  invalid: string[];
}

export class PhoneSanitizer {
  /**
   * Sanitize phone number to XXX-XXX-XXXX format
   * @param {string} input - Raw phone input
   * @returns {string | null} - Formatted phone or null if invalid
   */
  static sanitize(input: string | null | undefined): string | null {
    if (!input) return null;

    // Remove all non-digit characters
    const digits = input.replace(/\D/g, "");

    // Must be exactly 10 digits
    if (digits.length !== 10) {
      return null;
    }

    // Format as XXX-XXX-XXXX
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  /**
   * Validate phone number format
   * @param {string} input - Phone number to validate
   * @returns {boolean} - True if valid
   */
  static isValid(input: string | null | undefined): boolean {
    if (!input) return false;

    const digits = input.replace(/\D/g, "");
    return digits.length === 10;
  }

  /**
   * Get digits only (no formatting)
   * @param {string} input - Phone number
   * @returns {string | null} - Digits only or null
   */
  static getDigitsOnly(input: string | null | undefined): string | null {
    if (!input) return null;

    const digits = input.replace(/\D/g, "");
    return digits.length === 10 ? digits : null;
  }

  /**
   * Batch sanitize multiple phone numbers
   * @param {string[]} phoneArray - Array of phone numbers
   * @returns {SanitizationResult} - { valid: [], invalid: [] }
   */
  static sanitizeBatch(phoneArray: string[]): SanitizationResult {
    const result: SanitizationResult = {
      valid: [],
      invalid: [],
    };

    phoneArray.forEach((phone) => {
      const sanitized = this.sanitize(phone);
      if (sanitized) {
        result.valid.push(sanitized);
      } else {
        result.invalid.push(phone);
      }
    });

    return result;
  }

  /**
   * Type guard to check if a string is a valid phone number
   * @param {string} input - Phone number to check
   * @returns {boolean} - Type predicate
   */
  static isValidPhone(input: string): input is string {
    return this.isValid(input);
  }
}

//? usage
// // Export default instance for convenience
// export default PhoneSanitizer;

// import PhoneSanitizer, { SanitizationResult } from './phoneSanitizer';

// // Basic sanitization
// const phone1: string | null = PhoneSanitizer.sanitize('3121325537');        
// // "312-132-5537"

// const phone2: string | null = PhoneSanitizer.sanitize('(312) 132-5537');   
// // "312-132-5537"

// const phone3: string | null = PhoneSanitizer.sanitize('123');               
// // null

// // Validation
// const isValid: boolean = PhoneSanitizer.isValid('312-132-5537');  // true

// // Get digits only
// const digits: string | null = PhoneSanitizer.getDigitsOnly('312-132-5537'); 
// // "3121325537"

// // Batch processing
// const phones: string[] = ['3121325537', '123', '555-444-3333'];
// const result: SanitizationResult = PhoneSanitizer.sanitizeBatch(phones);
// // {
// //   valid: ['312-132-5537', '555-444-3333'],
// //   invalid: ['123']
// // }