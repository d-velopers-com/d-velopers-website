import { SVGProps } from "react";
import {Availability} from "@/lib/constants";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface SearchFilters {
  searchQuery?: string;
  english?: string;
  availability?: Availability | null;
  country?: string;
}
