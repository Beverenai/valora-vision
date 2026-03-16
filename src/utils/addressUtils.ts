export const reconstructAddressFromData = (addressData: {
  streetAddress: string;
  urbanization: string;
  city: string;
  province: string;
  country: string;
}): string => {
  const parts = [];

  if (addressData.streetAddress) parts.push(addressData.streetAddress);
  if (addressData.urbanization) parts.push(addressData.urbanization);
  if (addressData.city) parts.push(addressData.city);
  if (addressData.province) parts.push(addressData.province);
  if (addressData.country) parts.push(addressData.country);

  return parts.join(", ");
};
