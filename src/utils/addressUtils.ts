import { getGeocode, getLatLng } from "use-places-autocomplete";

export const updateAddressFromGeocode = (
  result: google.maps.GeocoderResult,
  onChange: (field: string, value: string) => void,
  setValue: () => void
) => {
  let streetAddress = "";
  let city = "";
  let province = "";
  let urbanization = "";
  let complex = "";

  result.address_components.forEach((component) => {
    const types = component.types;

    if (types.includes("street_number") || types.includes("route")) {
      streetAddress += (streetAddress ? " " : "") + component.long_name;
    } else if (types.includes("locality")) {
      city = component.long_name;
    } else if (types.includes("administrative_area_level_2")) {
      province = component.long_name;
    } else if (
      types.includes("sublocality") ||
      types.includes("sublocality_level_1") ||
      types.includes("neighborhood")
    ) {
      urbanization = component.long_name;
    } else if (
      types.includes("establishment") ||
      types.includes("point_of_interest")
    ) {
      complex = component.long_name;
    }
  });

  onChange("streetAddress", streetAddress);
  onChange("urbanization", urbanization);
  onChange("complex", complex);
  onChange("country", "Spain");

  if (setValue) setValue();
};

export const geocodeAddress = async (address: string) => {
  const results = await getGeocode({ address });
  const { lat, lng } = await getLatLng(results[0]);
  return { lat, lng, result: results[0] };
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const results = await getGeocode({ location: { lat, lng } });
  return results.length > 0 ? results[0] : null;
};

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
