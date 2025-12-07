"use client";

import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import { useTheme } from "next-themes";
import clsx from "clsx";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "light",
    "aria-label": `Switch to ${theme === "light" ? "dark" : "light"} mode`,
    onChange,
  });

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="inline-flex items-center justify-center min-h-[2rem] min-w-[4rem] px-2 rounded-lg">
        <div className="w-[22px] h-[22px]" />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center min-h-[2rem] min-w-[4rem] px-2 rounded-lg hover:bg-default-100 dark:hover:bg-default-50 transition-colors">
      <Component
        {...getBaseProps({
          className: clsx(
            "px-px transition-opacity hover:opacity-80 cursor-pointer",
            className,
            classNames?.base,
          ),
        })}
      >
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: clsx(
              [
                "w-auto h-auto",
                "bg-transparent",
                "rounded-lg",
                "flex items-center justify-center",
                "group-data-[selected=true]:bg-transparent",
                "!text-default-500",
                "pt-px",
                "px-0",
                "mx-0",
              ],
              classNames?.wrapper,
            ),
          })}
        >
          {isSelected ? (
            <SunFilledIcon size={22} />
          ) : (
            <MoonFilledIcon size={22} />
          )}
        </div>
      </Component>
    </div>
  );
};
