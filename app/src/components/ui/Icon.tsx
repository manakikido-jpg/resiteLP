/* インラインSVGアイコン（ui.jsx の Icon を移植・stroke ベース） */
import type { ReactElement } from "react";

export type IconName =
  | "search" | "back" | "plus" | "phone" | "pin" | "cal" | "user" | "briefcase"
  | "download" | "route" | "target" | "check" | "spark" | "users" | "chevL"
  | "chevR" | "clock" | "x" | "trash" | "edit" | "list" | "grid" | "bolt"
  | "arrowRight" | "chevUp" | "chevDown" | "form";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
}

const PATHS: Record<IconName, ReactElement> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  back: <path d="M15 18l-6-6 6-6" />,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  pin: <><path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></>,
  cal: <><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" /></>,
  download: <><path d="M12 3v12M7 11l5 5 5-5" /><path d="M5 21h14" /></>,
  route: <><circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="5" r="2.4" /><path d="M8.4 19H15a3 3 0 000-6H9a3 3 0 010-6h6.6" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />,
  users: <><circle cx="9" cy="8" r="3.4" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><path d="M16 5.2a3.4 3.4 0 010 5.6M17.5 20a5.5 5.5 0 00-3-4.9" /></>,
  chevL: <path d="M14 6l-6 6 6 6" />,
  chevR: <path d="M10 6l6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V5h6v2M6 7l1 13h10l1-13" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 5l4 4" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.4" /><rect x="14" y="3" width="7" height="7" rx="1.4" /><rect x="3" y="14" width="7" height="7" rx="1.4" /><rect x="14" y="14" width="7" height="7" rx="1.4" /></>,
  bolt: <path d="M13 3L5 13h6l-1 8 8-10h-6z" />,
  arrowRight: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  chevUp: <path d="M6 15l6-6 6 6" />,
  chevDown: <path d="M6 9l6 6 6-6" />,
  form: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
};

export function Icon({ name, size = 18, stroke = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
