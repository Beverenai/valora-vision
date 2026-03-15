import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const PRIORITY_COUNTRIES: CountryCode[] = [
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
];

const ALL_COUNTRIES: CountryCode[] = [
  { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { code: "+355", country: "Albania", flag: "🇦🇱" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+376", country: "Andorra", flag: "🇦🇩" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+385", country: "Croatia", flag: "🇭🇷" },
  { code: "+357", country: "Cyprus", flag: "🇨🇾" },
  { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+372", country: "Estonia", flag: "🇪🇪" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+36", country: "Hungary", flag: "🇭🇺" },
  { code: "+354", country: "Iceland", flag: "🇮🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+371", country: "Latvia", flag: "🇱🇻" },
  { code: "+370", country: "Lithuania", flag: "🇱🇹" },
  { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+356", country: "Malta", flag: "🇲🇹" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+40", country: "Romania", flag: "🇷🇴" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+421", country: "Slovakia", flag: "🇸🇰" },
  { code: "+386", country: "Slovenia", flag: "🇸🇮" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+380", country: "Ukraine", flag: "🇺🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
];

const PRIORITY_CODES = new Set(PRIORITY_COUNTRIES.map((c) => `${c.code}-${c.country}`));
const OTHER_COUNTRIES = ALL_COUNTRIES.filter(
  (c) => !PRIORITY_CODES.has(`${c.code}-${c.country}`)
);
const ALL_LOOKUP = [...PRIORITY_COUNTRIES, ...OTHER_COUNTRIES];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange }) => {
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedFlag, setSelectedFlag] = useState("");
  const [localNumber, setLocalNumber] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) return;
    const match = value.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      const found = ALL_LOOKUP.find((c) => c.code === match[1]);
      if (found) {
        setSelectedCode(found.code);
        setSelectedFlag(found.flag);
        setLocalNumber(match[2]);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emitValue = (code: string, num: string) => {
    const trimmed = num.trim();
    if (code && trimmed) {
      onChange(`${code} ${trimmed}`);
    } else {
      onChange("");
    }
  };

  const handleSelect = (country: CountryCode) => {
    setSelectedCode(country.code);
    setSelectedFlag(country.flag);
    setOpen(false);
    emitValue(country.code, localNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s]/g, "");
    setLocalNumber(num);
    emitValue(selectedCode, num);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[110px] shrink-0 justify-between px-2 text-sm font-normal"
          >
            {selectedCode ? (
              <span>
                {selectedFlag} {selectedCode}
              </span>
            ) : (
              <span className="text-muted-foreground">Code</span>
            )}
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup heading="Popular">
                {PRIORITY_COUNTRIES.map((c) => (
                  <CommandItem
                    key={`p-${c.code}-${c.country}`}
                    value={`${c.country} ${c.code}`}
                    onSelect={() => handleSelect(c)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        selectedCode === c.code && selectedFlag === c.flag
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {c.flag} {c.country} ({c.code})
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="All countries">
                {OTHER_COUNTRIES.map((c) => (
                  <CommandItem
                    key={`a-${c.code}-${c.country}`}
                    value={`${c.country} ${c.code}`}
                    onSelect={() => handleSelect(c)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        selectedCode === c.code && selectedFlag === c.flag
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {c.flag} {c.country} ({c.code})
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        inputMode="tel"
        value={localNumber}
        onChange={handleNumberChange}
        className="flex-1 text-base"
        placeholder="612 345 678"
        style={{ fontSize: "16px" }}
      />
    </div>
  );
};

export default PhoneInput;
