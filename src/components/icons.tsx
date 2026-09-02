import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(children: React.ReactNode, props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return base(
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9" />
    </>,
    props,
  );
}

export function HistoryIcon(props: IconProps) {
  return base(
    <>
      <path d="M4 4v5h5" />
      <path d="M4.5 9A8 8 0 1 1 6 16.5" />
      <path d="M12 8v5l3 2" />
    </>,
    props,
  );
}

export function CameraIcon(props: IconProps) {
  return base(
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>,
    props,
  );
}

export function UserIcon(props: IconProps) {
  return base(
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" />
    </>,
    props,
  );
}

export function ChevronRightIcon(props: IconProps) {
  return base(<path d="m9 6 6 6-6 6" />, props);
}

export function CheckIcon(props: IconProps) {
  return base(<path d="m5 12.5 4.5 4.5L19 7" />, props);
}

export function PlusIcon(props: IconProps) {
  return base(
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>,
    props,
  );
}

export function XIcon(props: IconProps) {
  return base(
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>,
    props,
  );
}

export function TrashIcon(props: IconProps) {
  return base(
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>,
    props,
  );
}

export function ImageIcon(props: IconProps) {
  return base(
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m5 18 5-5 3 3 3-3.5 3 4" />
    </>,
    props,
  );
}

export function LogOutIcon(props: IconProps) {
  return base(
    <>
      <path d="M9 20H6a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 6 4h3" />
      <path d="M15 16l4-4-4-4" />
      <path d="M19 12H9" />
    </>,
    props,
  );
}

export function AlertIcon(props: IconProps) {
  return base(
    <>
      <path d="M12 4 3 20h18Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </>,
    props,
  );
}

export function SearchIcon(props: IconProps) {
  return base(
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.5-4.5" />
    </>,
    props,
  );
}


export function ChevronLeftIcon(props: IconProps) {
  return base(<path d="m15 6-6 6 6 6" />, props);
}

export function ClockIcon(props: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </>,
    props,
  );
}

export function UtensilsIcon(props: IconProps) {
  return base(
    <>
      <path d="M7 3v6a1.5 1.5 0 0 0 3 0V3" />
      <path d="M8.5 3v18" />
      <path d="M16.5 3c-1.4 0-2.5 1.6-2.5 5s1.1 5 2.5 5V21" />
    </>,
    props,
  );
}

export function UsersIcon(props: IconProps) {
  return base(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.8-3 3-4.8 5.5-4.8s4.7 1.8 5.5 4.8" />
      <path d="M15.5 5.5A3 3 0 1 1 16 11.4" />
      <path d="M16.5 15.3c2 .4 3.6 2 4.2 4.7" />
    </>,
    props,
  );
}

export function SunIcon(props: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>,
    props,
  );
}

export function MoonIcon(props: IconProps) {
  return base(<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />, props);
}

export function SettingsIcon(props: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" />
    </>,
    props,
  );
}

export function PencilIcon(props: IconProps) {
  return base(
    <>
      <path d="M4 20l.9-3.6L15.6 5.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L7.6 19.1 4 20Z" />
      <path d="M14 7l3 3" />
    </>,
    props,
  );
}
