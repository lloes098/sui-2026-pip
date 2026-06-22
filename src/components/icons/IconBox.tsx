import type { LucideIcon } from "lucide-react";

type IconBoxProps = {
  icon: LucideIcon;
  boxClassName?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
} as const;

export function IconBox({
  icon: Icon,
  boxClassName,
  iconClassName,
  size = "md",
}: IconBoxProps) {
  const { box, icon } = sizes[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-surface ${box} ${boxClassName ?? ""}`}
    >
      <Icon className={`${icon} ${iconClassName ?? ""}`} strokeWidth={2.25} />
    </div>
  );
}
