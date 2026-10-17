const base = {
  width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false,
};
const make = (children) => (props) => <svg {...base} {...props}>{children}</svg>;

export const HomeIcon = make(<><path d="M3.5 11.2 12 4l8.5 7.2" /><path d="M5.8 9.7V20h12.4V9.7" /></>);
export const ChartIcon = make(<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 16v-4M12 16V8M15.5 16v-2.5" /></>);
export const PieIcon = make(<><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z" /><path d="M15 3.8a8.5 8.5 0 0 1 5.2 5.2H15z" /></>);
export const BoxIcon = make(<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M4 13h4.5l1 2h5l1-2H20" /></>);
export const MoonIcon = make(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />);
export const SettingsIcon = make(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.8" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" /></>);
export const SearchIcon = make(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>);
export const BellIcon = make(<><path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></>);
export const CalendarIcon = make(<><rect x="4" y="5.5" width="16" height="14.5" rx="3" /><path d="M4 10h16M8.5 3.5v3M15.5 3.5v3" /></>);
export const ChevronDown = make(<path d="m6 9.5 6 6 6-6" />);
export const ChevronLeft = make(<path d="m14.5 6-6 6 6 6" />);
export const ChevronRight = make(<path d="m9.5 6 6 6-6 6" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const DocIcon = make(<><path d="M7 3.5h6.5L18 8v12.5H7z" /><path d="M13.5 3.5V8H18M9.8 14l1.8 1.8 3-3.2" /></>);
export const PencilIcon = make(<><path d="M5 19l.8-3.6L16.6 4.6a1.8 1.8 0 0 1 2.5 0l.3.3a1.8 1.8 0 0 1 0 2.5L8.6 18.2z" /><path d="m14.8 6.4 2.8 2.8" /></>);
export const TrashIcon = make(<><path d="M5 7h14M10 7V4.8h4V7M7 7l.8 12.5h8.4L17 7" /><path d="M10.5 11v5M13.5 11v5" /></>);
export const EyeIcon = make(<><path d="M2.8 12S6 5.8 12 5.8 21.2 12 21.2 12 18 18.2 12 18.2 2.8 12 2.8 12z" /><circle cx="12" cy="12" r="2.8" /></>);
export const KebabIcon = (props) => (
  <svg {...base} fill="currentColor" stroke="none" {...props}>
    <circle cx="12" cy="5.5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="18.5" r="1.7" />
  </svg>
);
