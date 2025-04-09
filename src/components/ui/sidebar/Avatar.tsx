import { cn } from "../../../lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const Avatar = ({ src, alt, className, ...props }: AvatarProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "rounded-full object-cover",
        className
      )}
      {...props}
    />
  );
}; 