export interface Props {
  size?: "sm" | "lg";
  className?: string;
  readingTime?: string;
}

export default function ReadingTime({
  size = "sm",
  className,
  readingTime,
}: Props) {
  return (
    <div
      className={`${
        size === "sm" ? "space-x-1" : "space-x-2"
      } flex items-center opacity-80 ${className}`}
    >
      <svg
        className={`${
          size === "sm" ? "scale-75" : "scale-100"
        } inline-block h-6 w-6 fill-skin-base`}
        fill="none"
        viewBox="0 0 15 15"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M7.5.877a6.623 6.623 0 100 13.246A6.623 6.623 0 007.5.877zM1.827 7.5a5.673 5.673 0 1111.346 0 5.673 5.673 0 01-11.346 0zM8 4.5a.5.5 0 00-1 0v3a.5.5 0 00.146.354l2 2a.5.5 0 00.708-.708L8 7.293V4.5z"
          clipRule="evenodd"
        />
      </svg>
      <span className={`italic ${size === "sm" ? "text-sm" : "text-base"}`}>
        {readingTime}
      </span>
    </div>
  );
}
