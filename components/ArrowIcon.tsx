/**
 * Chunky rounded arrow used in buttons and links. Put it inside an element with the `group`
 * class and it slides forward on hover.
 */
export default function ArrowIcon({ direction = "right", className = "h-4 w-4" }: { direction?: "right" | "left"; className?: string }) {
  const left = direction === "left";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 transition-transform duration-200 ${
        left ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
      } ${className}`}
    >
      <path d="M4 12h14" />
      <path d="M12.5 5.5 19 12l-6.5 6.5" />
    </svg>
  );
}
