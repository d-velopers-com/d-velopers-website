"use client";

import { useMemo, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { countries, getCountryFlagUrl, getCountryName } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
  variant?: "bordered" | "flat" | "faded" | "underlined";
  label?: string;
  classNames?: {
    base?: string;
    selectorButton?: string;
    innerWrapper?: string;
    inputWrapper?: string;
  };
  isDisabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select your country",
  variant = "bordered",
  label,
  classNames,
  isDisabled = false,
}: CountrySelectProps) {
  const [searchValue, setSearchValue] = useState("");

  const filteredCountries = useMemo(() => {
    if (!searchValue) {
      return countries;
    }
    return countries.filter((c) =>
      c.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue]);

  return (
    <Autocomplete
      classNames={classNames}
      inputValue={
        searchValue ||
        (value ? countries.find((c) => c.code === value)?.name || "" : "")
      }
      isDisabled={isDisabled}
      items={filteredCountries}
      label={label}
      placeholder={placeholder}
      selectedKey={value || undefined}
      startContent={
        value && !searchValue ? (
          <img
            alt={getCountryName(value)}
            className="w-5 h-4 rounded object-cover"
            src={getCountryFlagUrl(value, "24")}
          />
        ) : null
      }
      variant={variant}
      onInputChange={(inputValue) => {
        setSearchValue(inputValue);
        if (!inputValue) {
          onChange("");
        } else {
          if (value) {
            const selectedCountry = countries.find((c) => c.code === value);

            if (
              selectedCountry &&
              !selectedCountry.name
                .toLowerCase()
                .startsWith(inputValue.toLowerCase())
            ) {
              onChange("");
            }
          }
        }
      }}
      onSelectionChange={(key) => {
        if (key) {
          onChange(key as string);
          setSearchValue("");
        } else {
          onChange("");
          setSearchValue("");
        }
      }}
    >
      {(country) => (
        <AutocompleteItem
          key={country.code}
          startContent={
            <img
              alt={country.name}
              className="w-5 h-4 rounded object-cover"
              src={getCountryFlagUrl(country.code, "24")}
            />
          }
          textValue={country.name}
        >
          {country.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
