import { LOCALE } from "@config";

export interface Props {
  datetime: string | Date;
  size?: "sm" | "lg";
  className?: string;
}

export default function Datetime({ datetime, size = "sm", className }: Props) {
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
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="32"
          d="M96 80 H416 A48 48 0 0 1 464 128 V416 A48 48 0 0 1 416 464 H96 A48 48 0 0 1 48 416 V128 A48 48 0 0 1 96 80 z"
        />
        <path d="M320 232 A24 24 0 0 1 296 256 A24 24 0 0 1 272 232 A24 24 0 0 1 320 232 z" />
        <path d="M400 232 A24 24 0 0 1 376 256 A24 24 0 0 1 352 232 A24 24 0 0 1 400 232 z" />
        <path d="M320 312 A24 24 0 0 1 296 336 A24 24 0 0 1 272 312 A24 24 0 0 1 320 312 z" />
        <path d="M400 312 A24 24 0 0 1 376 336 A24 24 0 0 1 352 312 A24 24 0 0 1 400 312 z" />
        <path d="M160 312 A24 24 0 0 1 136 336 A24 24 0 0 1 112 312 A24 24 0 0 1 160 312 z" />
        <path d="M240 312 A24 24 0 0 1 216 336 A24 24 0 0 1 192 312 A24 24 0 0 1 240 312 z" />
        <path d="M160 392 A24 24 0 0 1 136 416 A24 24 0 0 1 112 392 A24 24 0 0 1 160 392 z" />
        <path d="M240 392 A24 24 0 0 1 216 416 A24 24 0 0 1 192 392 A24 24 0 0 1 240 392 z" />
        <path d="M320 392 A24 24 0 0 1 296 416 A24 24 0 0 1 272 392 A24 24 0 0 1 320 392 z" />
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
          d="M128 48v32M384 48v32"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="32"
          d="M464 160H48"
        />
      </svg>
      <span className="sr-only">Posted on:</span>
      <span className={`italic ${size === "sm" ? "text-sm" : "text-base"}`}>
        {FormattedDate(datetime)}
      </span>
    </div>
  );
}

const FormattedDate = (datetime: string | Date) => {
  const myDatetime = new Date(datetime);

  const date = myDatetime.toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return date;
};
