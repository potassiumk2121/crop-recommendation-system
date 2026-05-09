/** Lightweight inline SVGs — avoids extra icon dependency bundles. */

export function LayoutDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13" y="3" width="8" height="5" rx="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13" y="10" width="8" height="11" rx="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="13" width="8" height="8" rx="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Leaf(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        d="M11 21c6-6 7-17 7-17S7 6 11 21z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 21S7 10 17 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function History(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M3 12a9 9 0 1 0 3-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarChart3(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M6 20V10M12 20V4M18 20v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogOut(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4M14 13l5-5-5-5M19 8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sprout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M12 22v-7" strokeLinecap="round" />
      <path
        d="M8 22c4-6 10-9 12-17-8 3-13 11-13 21M16 22C12 17 11 13 11 13s3 1 9 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function Moon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M21 13a8 9 0 1 1-10-11 10 11 10 11 11 21z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Menu(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
