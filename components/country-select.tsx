"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";

import { countries, getCountryFlagUrl } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
  variant?: "bordered" | "flat" | "faded" | "underlined";
  label?: string;
  ariaLabel?: string;
  clearButtonLabel?: string;
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
  ariaLabel,
  clearButtonLabel,
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
      aria-label={ariaLabel}
      classNames={classNames}
      clearButtonProps={
        clearButtonLabel
          ? {
              "aria-label": clearButtonLabel,
            }
          : undefined
      }
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
          <Image
            alt=""
            className="w-5 h-4 rounded object-cover"
            height={15}
            src={getCountryFlagUrl(value, "24")}
            width={20}
          />
        ) : null
      }
      variant={variant}
      onInputChange={(inputValue) => {
        setSearchValue(inputValue);
        if (value) {
          const selectedCountry = countries.find((c) => c.code === value);
          if (
            inputValue &&
            selectedCountry &&
            !selectedCountry.name
              .toLowerCase()
              .startsWith(inputValue.toLowerCase())
          ) {
            onChange("");
          }
        }
      }}
      onSelectionChange={(key) => {
        const newValue = key ? (key as string) : "";
        if (newValue !== value) {
          onChange(newValue);
        }
        setSearchValue("");
      }}
    >
      {(country) => (
        <AutocompleteItem
          key={country.code}
          startContent={
            <Image
              alt=""
              className="w-5 h-4 rounded object-cover"
              height={15}
              src={getCountryFlagUrl(country.code, "24")}
              width={20}
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
