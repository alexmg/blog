import ReadingTime from "./ReadingTime";
import Datetime from "./Datetime";

export interface Props {
  datetime: string | Date;
  readingTime?: string;
  size?: "sm" | "lg";
  className?: string;
}

export default function PostMetadata({
  datetime,
  readingTime,
  size = "sm",
  className,
}: Props) {
  return (
    <div className="my-3 flex items-center space-x-5 opacity-80">
      <Datetime datetime={datetime} size={size} className={className} />
      <ReadingTime
        readingTime={readingTime}
        size={size}
        className={className}
      />
    </div>
  );
}
