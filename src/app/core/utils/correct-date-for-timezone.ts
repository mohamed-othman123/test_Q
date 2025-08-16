export function correctDateForTimezone(dateString: string) {
  const date = new Date(dateString); // Original UTC date
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Adjust for local timezone
  return date.toISOString();
}
