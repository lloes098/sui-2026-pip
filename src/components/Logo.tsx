import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 32, className = "", priority = false }: LogoProps) {
  return (
    <Image
      src="/pip-logo.png"
      alt="PIP"
      width={size}
      height={size}
      priority={priority}
      className={`invert ${className}`.trim()}
    />
  );
}
