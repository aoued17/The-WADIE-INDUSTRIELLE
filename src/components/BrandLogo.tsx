export function BrandLogo({ darkSurface = true }: { darkSurface?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <svg
        width="32"
        height="32"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="4"
          fill={darkSurface ? '#2A3038' : '#20252B'}
          stroke="#F28C28"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 11.5L13 24.5L18 14.5L23 24.5L27.5 11.5"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <rect x="8.5" y="26.5" width="19" height="2" fill="#F28C28" />
      </svg>
      <span
        className={`font-display text-base sm:text-lg font-bold tracking-tight whitespace-nowrap ${
          darkSurface ? 'text-[#FFFFFF]' : 'text-[#20252B]'
        }`}
      >
        WADIE <span className="text-[#F28C28]">INDUSTRIELLE</span>
      </span>
    </span>
  );
}
