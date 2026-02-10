interface PrettyFormatOptions {
  defaultCountryCode?: string;
}

/**
 * Formats a phone number to a pretty format (manual implementation)
 * @param input - Phone number (preferably E.164 format)
 * @param options - Configuration options
 * @returns Formatted phone number like "+1 (123) 123-1234"
 */
export function formatPhonePrettyManual(
  input: string,
  options: PrettyFormatOptions = { defaultCountryCode: '1' }
): string {
  if (!input) {
    throw new Error('Phone number is required');
  }

  const { defaultCountryCode = '1' } = options;

  // Remove all non-digit characters
  let digitsOnly = input.replace(/\D/g, '');

  // Extract country code
  let countryCode: string;
  let nationalNumber: string;

  if (input.startsWith('+')) {
    // Has explicit country code
    if (digitsOnly.startsWith('1') && digitsOnly.length === 11) {
      // North American number
      countryCode = '1';
      nationalNumber = digitsOnly.slice(1);
    } else if (digitsOnly.length > 10) {
      // International - try to extract country code (simplified logic)
      // This is a simplified version; real implementation would need country code lookup
      const possibleCountryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      countryCode = possibleCountryCode;
      nationalNumber = digitsOnly.slice(possibleCountryCode.length);
    } else {
      countryCode = defaultCountryCode;
      nationalNumber = digitsOnly;
    }
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // Likely North American with country code
    countryCode = '1';
    nationalNumber = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10) {
    // No country code, use default
    countryCode = defaultCountryCode;
    nationalNumber = digitsOnly;
  } else {
    // Uncertain format
    throw new Error('Unable to parse phone number format');
  }

  // Format based on country code
  if (countryCode === '1' && nationalNumber.length === 10) {
    // North American format: +1 (123) 123-1234
    const areaCode = nationalNumber.slice(0, 3);
    const firstPart = nationalNumber.slice(3, 6);
    const secondPart = nationalNumber.slice(6, 10);
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  } else {
    // Generic international format: +CC XXXXXXXXXX
    return `+${countryCode} ${nationalNumber}`;
  }
}

// Example usage:
/*
console.log(formatPhonePrettyManual('+11231231234')); // "+1 (123) 123-1234"
console.log(formatPhonePrettyManual('1231231234')); // "+1 (123) 123-1234"
console.log(formatPhonePrettyManual('(123) 123-1234')); // "+1 (123) 123-1234"
console.log(formatPhonePrettyManual('+11231231234')); // "+1 (123) 123-1234"
*/