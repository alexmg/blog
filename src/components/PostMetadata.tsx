import ReadingTime from "./ReadingTime";
import Datetime from "./Datetime";

export interface Props {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined;
  readingTime?: string;
  size?: "sm" | "lg";
  className?: string;
}

export default function PostMetadata({
  pubDatetime,
  modDatetime,
  readingTime,
  size = "sm",
  className,
}: Props) {
  return (
    <div className="my-3 flex items-center space-x-5 opacity-80">
      <Datetime
        pubDatetime={pubDatetime}
        modDatetime={modDatetime}
        size={size}
        className={className}
      />
      <ReadingTime
        readingTime={readingTime}
        size={size}
        className={className}
      />
    </div>
  );
}
