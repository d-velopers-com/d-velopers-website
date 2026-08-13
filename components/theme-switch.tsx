"use client";

import { SwitchProps, useSwitch } from "@heroui/switch";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { FC, useState, useEffect } from "react";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";
import { useLanguage } from "@/contexts/language-context";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
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
    "aria-label":
      theme === "light"
        ? t.common.switchToDarkMode
        : t.common.switchToLightMode,
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
