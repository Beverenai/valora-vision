import React, { useRef, useEffect, useState, useCallback } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader, Search, X } from "lucide-react";

interface AddressSearchInputProps {
  isLoaded: boolean;
  onAddressSelect: (address: string) => void;
  onAddressClear?: () => void;
  onSearchInputRef?: (ref: {
    setValue: (value: string, shouldFetchData?: boolean) => void;
    clearSuggestions: () => void;
  }) => void;
  currentAddress?: string;
}

const MARBELLA_CENTER = { lat: 36.5092, lng: -4.8857 };

const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  isLoaded,
  onAddressSelect,
  onAddressClear,
  onSearchInputRef,
  currentAddress,
}) => {
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [previousAddress, setPreviousAddress] = useState("");
  const [hasSelectedFromSuggestions, setHasSelectedFromSuggestions] = useState(false);
  const manualClearRef = useRef(false);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: isLoaded
        ? new google.maps.LatLng(MARBELLA_CENTER.lat, MARBELLA_CENTER.lng)
        : undefined,
      radius: 100000,
      componentRestrictions: { country: "es" },
    },
    debounce: 300,
    callbackName: isLoaded ? "initMap" : undefined,
  });

  useEffect(() => {
    if (onSearchInputRef) {
      onSearchInputRef({ setValue, clearSuggestions });
    }
  }, [onSearchInputRef, setValue, clearSuggestions]);

  useEffect(() => {
    if (currentAddress && !value && !manualClearRef.current) {
      setPreviousAddress(currentAddress);
      setValue(currentAddress, false);
      setHasSelectedFromSuggestions(true);
    }
  }, [currentAddress, setValue, value]);

  useEffect(() => {
    if (
      currentAddress &&
      currentAddress !== value &&
      !isUserEditing &&
      hasSelectedFromSuggestions &&
      !manualClearRef.current
    ) {
      setPreviousAddress(currentAddress);
      setValue(currentAddress, false);
      clearSuggestions();
      setIsUserTyping(false);
    }
  }, [currentAddress, setValue, value, isUserEditing, hasSelectedFromSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        clearSuggestions();
        setIsUserTyping(false);
        setIsUserEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearSuggestions]);

  const handleInputBlur = () => {
    setTimeout(() => {
      clearSuggestions();
      setIsUserTyping(false);
      setIsUserEditing(false);
      setHasSelectedFromSuggestions(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      clearSuggestions();
      setIsUserTyping(false);
      setIsUserEditing(false);
    }
  };

  const handleSelect = async (address: string) => {
    manualClearRef.current = false;
    setValue(address, false);
    setPreviousAddress(address);
    setHasSelectedFromSuggestions(true);
    clearSuggestions();
    setIsUserTyping(false);
    setIsUserEditing(false);
    onAddressSelect(address);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsUserEditing(true);
    setHasSelectedFromSuggestions(false);

    if (newValue === "") {
      manualClearRef.current = true;
      setPreviousAddress("");
      clearSuggestions();
      setIsUserTyping(false);
      onAddressClear?.();
      return;
    }

    setIsUserTyping(newValue.length >= 2);
  };

  const handleInputFocus = () => {
    setIsUserEditing(true);
  };

  const handleClear = () => {
    manualClearRef.current = true;
    setValue("", false);
    setPreviousAddress("");
    setHasSelectedFromSuggestions(false);
    clearSuggestions();
    setIsUserTyping(false);
    setIsUserEditing(false);
    onAddressClear?.();
  };

  const isSearchReady = isLoaded && ready;
  const showNoResults =
    isUserTyping &&
    value.length >= 2 &&
    status !== "OK" &&
    data.length === 0;

  return (
    <div className="relative">
      <Label htmlFor="address-search" className="text-base font-medium text-foreground">
        Address <span className="text-destructive">*</span>
      </Label>
      <div className="relative mt-1">
        <Input
          id="address-search"
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={isSearchReady ? "Insert address here" : "Loading address search..."}
          className="pr-10"
          disabled={!isSearchReady}
          required
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {value && isSearchReady && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear address"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
          <div className="pointer-events-none">
            {!isSearchReady ? (
              <Loader size={18} className="animate-spin text-primary" />
            ) : (
              <Search size={18} className="text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {!isSearchReady && (
        <div className="mt-1 text-xs text-muted-foreground">
          Initializing address search...
        </div>
      )}

      {status === "OK" && isUserTyping && isSearchReady && data.length > 0 && (
        <div
          ref={suggestionsContainerRef}
          className="absolute z-10 w-full mt-1 rounded-md border border-border bg-popover shadow-lg max-h-60 overflow-auto"
        >
          {data.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="px-4 py-2 cursor-pointer hover:bg-accent/10 flex items-start text-popover-foreground"
              onClick={() => handleSelect(suggestion.description)}
            >
              <MapPin size={16} className="text-primary mt-1 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {suggestion.structured_formatting.main_text}
                </div>
                <div className="text-xs text-muted-foreground">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNoResults && (
        <div
          ref={suggestionsContainerRef}
          className="absolute z-10 w-full mt-1 rounded-md border border-border bg-popover shadow-lg p-3 text-center text-muted-foreground text-sm"
        >
          No addresses found. Try searching for a nearby town or area.
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;
