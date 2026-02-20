interface FormatPhoneOptions {
  defaultCountryCode?: string;
}

/**
 * Sanitizes and formats a phone number to E.164 format (manual implementation)
 * @param input - Raw phone number input
 * @param options - Configuration options
 * @returns Formatted phone number in E.164 format
 */
export function formatPhoneToE164Manual(
  input?: string,
  options: FormatPhoneOptions = { defaultCountryCode: "1" },
) {
  // TODO how to make validation work with other forms
  // if (!input) {
  //   throw new Error("Formatter: Phone number is required");
  // }
  if (!input) return undefined;

  const { defaultCountryCode = "1" } = options;

  // Step 1: Remove all non-digit characters
  let digitsOnly = input.replace(/\D/g, "");

  // Step 2: Handle country code
  let e164: string;

  //? must have `+` in front if prefix country code
  if (input.startsWith("+") && digitsOnly.length === 11) {
    // Already has a + prefix, just clean it
    e164 = "+" + digitsOnly;
  } else if (digitsOnly.length === 10) {
    // US number without country code (e.g., 1231231234)
    e164 = `+${defaultCountryCode}${digitsOnly}`;
  } else {
    // Too short return empty string (which will cause validation error)
    throw new Error("Phone Formatter: Too short, must have missed a number");
  }

  return e164;
}

interface PrettyFormatOptions {
  defaultCountryCode?: string;
}

/**
 * Formats a phone number to a pretty format (manual implementation)
 * @param input - Phone number (preferably E.164 format)
 * @param options - Configuration options
 * @returns Formatted phone number like "+1 (123) 123-1234" or undefined
 */
export function formatPhonePrettyManual(
  input: string | undefined,
  options: PrettyFormatOptions = { defaultCountryCode: "1" },
): string | undefined {
  if (!input) return undefined;
  // if (input === undefined || input === null) {
  //   throw new Error("Formatter: Phone number is required");
  // }
  // if (input === "") return "";

  const { defaultCountryCode = "1" } = options;

  // Remove all non-digit characters
  let digitsOnly = input.replace(/\D/g, "");

  // Extract country code
  let countryCode: string;
  let nationalNumber: string;

  if (input.startsWith("+")) {
    // Has explicit country code
    if (digitsOnly.startsWith("1") && digitsOnly.length === 11) {
      // North American number
      countryCode = "1";
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
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    // Likely North American with country code
    countryCode = "1";
    nationalNumber = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10) {
    // No country code, use default
    countryCode = defaultCountryCode;
    nationalNumber = digitsOnly;
  } else {
    // Uncertain format
    throw new Error("Unable to parse phone number format");
  }

  // Format based on country code
  if (countryCode === "1" && nationalNumber.length === 10) {
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

export const prettyDateLocaleFull = (date: string) => {
  return new Date(date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const dateToLocaleFieldValue = (date: string) => {
  return new Date(date)
    .toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(", ", "T");
};

// Example usage:
/*
formatPhonePrettyManual('+11231231234'); // "+1 (123) 123-1234"
formatPhonePrettyManual('1231231234'); // "+1 (123) 123-1234"
formatPhonePrettyManual('(123) 123-1234'); // "+1 (123) 123-1234"
formatPhonePrettyManual('+11231231234'); // "+1 (123) 123-1234"
*/

/**
 * Convert an API date string (with offset) into a local datetime string
 * in the target IANA timezone, formatted as "YYYY-MM-DDTHH:mm".
 */
export function toLocalDateTimeString(
  apiDateString: string,
  timeZone: string
): string {
  const date = new Date(apiDateString);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${apiDateString}`);
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,             // e.g. "America/Chicago"
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value;

  const y = get("year");
  const m = get("month");
  const d = get("day");
  const h = get("hour");
  const min = get("minute");

  if (!y || !m || !d || !h || !min) {
    throw new Error(`Failed to format date parts for ${timeZone}`);
  }

  return `${y}-${m}-${d}T${h}:${min}`;
}

export function localDateTimeToRealDate(
  dateLocal: string,        // "2026-02-26T19:00"
  timeZone: string          // "America/Chicago"
): Date {
  // Parse components manually (do NOT let Date guess)
  const [datePart, timePart] = dateLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a UTC date from the components
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Ask Intl what the offset is for this timezone at that moment
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(utcDate);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);

  const adjusted = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  return new Date(adjusted);
}