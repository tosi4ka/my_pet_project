export default function LogoIcon({
  size = 40,
  title = 'Lang Spark Logo',
}: {
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M31 8H17a9 9 0 0 0-9 9v7a9 9 0 0 0 9 9h2.6c.5 0 .98.2 1.33.55L25 37.9c.63.63 1.7.18 1.7-.71v-3.64H31a9 9 0 0 0 9-9v-7a9 9 0 0 0-9-9Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 17.5c3.4-1.6 6.1-1.6 9.5 0v10.6c-3.4-1.6-6.1-1.6-9.5 0V17.5Z"
        stroke="currentColor"
        strokeWidth="2.0"
        strokeLinejoin="round"
      />
      <path
        d="M31.5 17.5c-3.4-1.6-6.1-1.6-9.5 0v10.6c3.4-1.6 6.1-1.6 9.5 0V17.5Z"
        stroke="currentColor"
        strokeWidth="2.0"
        strokeLinejoin="round"
      />
      <path
        d="M37 10l1.6-1.6M37 10l-1.6-1.6M37 10l1.6 1.6M37 10l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
