/**
 * Formats an Ethereum address by showing only the first and last few characters
 * @param address The Ethereum address to format
 * @param startLength Number of characters to show at the start (default: 6)
 * @param endLength Number of characters to show at the end (default: 4)
 * @returns Formatted address string
 */
export const formatAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string => {
  if (!address) return "";
  if (address.length < startLength + endLength) return address;

  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);

  return `${start}...${end}`;
};
