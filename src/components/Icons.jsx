const I = ({ d, size = 18, color = 'currentColor', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
)

export const DashboardIcon = (p) => <I {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>} />
export const PlusIcon = (p) => <I {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>} />
export const ClockIcon = (p) => <I {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>} />
export const BellIcon = (p) => <I {...p} d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>} />
export const ChevronDownIcon = (p) => <I {...p} d="M6 9l6 6 6-6" />
export const UserIcon = (p) => <I {...p} d={<><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" /></>} />
export const SearchIcon = (p) => <I {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>} />
export const ArrowRightIcon = (p) => <I {...p} d="M5 12h14M12 5l7 7-7 7" />
export const ArrowLeftIcon = (p) => <I {...p} d="M19 12H5M12 19l-7-7 7-7" />
export const TrashIcon = (p) => <I {...p} d={<><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></>} />
export const CheckIcon = (p) => <I {...p} d="M20 6L9 17l-5-5" />
export const XIcon = (p) => <I {...p} d="M18 6L6 18M6 6l12 12" />
export const MenuIcon = (p) => <I {...p} d="M4 6h16M4 12h16M4 18h16" />
