import * as React from "react";
import { cn } from "../utils/cn";
import { Eye, Download } from "lucide-react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export interface CustomCardProps {
  /** URL for the top image */
  image?: string;
  /** Main title of the card */
  title: string;
  /** Array of stat items, e.g. [{ value: '4', label: 'Semaines :' }, { value: '3', label: 'Seance' }] */
  stats?: {
    value?: string | number;
    label: string;
  }[];
  /** Array of tag strings, e.g. ["Mobilité", "Tag 2"] */
  tags?: string[];
  /** Whether the text and elements should be centered (like the 'Exerice 1' example) */
  centered?: boolean;
  /** Whether to show the eye and download action icons on Top of the image */
  showActions?: boolean;
  /** Callback for when the eye icon is clicked */
  handleShow?: () => void;
  /** Callback for when the download icon is clicked */
  handleDownload?: () => void;
  className?: string;
}

export function CustomCard({
  image,
  title,
  stats,
  tags,
  centered = false,
  showActions = false,
  handleShow,
  handleDownload,
  className,
}: CustomCardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border bg-white p-2.5 shadow-sm flex flex-col",
        className,
      )}
    >
      {/* Top Image */}
      {image && (
        <div className="w-full aspect-[2/1] overflow-hidden rounded-[20px] bg-gray-100 flex-shrink-0 relative">
          {/* Using next/image or native img. Native img used for simplicity/flexibility in UI library. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover absolute inset-0 text-xs text-gray-400"
          />

          {/* Action Icons Overlay */}
          {showActions && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShow?.();
                }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white cursor-pointer hover:bg-white/40 transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload?.();
                }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white cursor-pointer hover:bg-white/40 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div
        className={cn(
          "px-2 flex flex-col mt-3 mb-2 gap-2",
          centered && "items-center text-center",
        )}
      >
        <h3
          className={cn(
            "font-semibold text-gray-900 leading-tight",
            centered ? "text-lg mb-1" : "text-[15px]",
          )}
        >
          {title}
        </h3>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div
            className={cn(
              "flex items-center w-full",
              centered ? "justify-center gap-6 mt-1" : "gap-3 mt-1",
            )}
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-baseline gap-1.5 font-medium whitespace-nowrap"
              >
                {stat.value !== undefined && (
                  <span className="text-[#00BEBB] text-[15px]">
                    {stat.value}
                  </span>
                )}
                <span className="text-gray-300 text-[14px]">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags Row */}
        {tags && tags.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              stats && stats.length > 0 ? "mt-2" : "mt-1",
              centered && "justify-center",
            )}
          >
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-1 rounded-full border border-secondary-500 text-secondary-500 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export interface DashboardCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: React.ReactNode | string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DashboardCard({
  title,
  extra,
  children,
  footer,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col border-gray-300 shadow-none rounded-[20px]",
        className,
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-50 pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 leading-none">
          {title}
        </CardTitle>
        {extra}
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-6 flex flex-col">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t border-gray-50 p-4 pt-4 mt-auto">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

export interface DashedCreateCardProps {
  /** The label text to display, e.g. 'Créer un programme' */
  label: string;
  /** Callback for click interaction */
  onClick?: () => void;
  className?: string;
}

/**
 * A specialized card for 'Add/Create' actions with a dashed border and centered icon.
 */
export function DashedCreateCard({
  label,
  onClick,
  className,
}: DashedCreateCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group h-full min-h-[200px] w-full rounded-[28px] border-2 border-dashed border-[#00BEBB]/30 bg-white p-4 flex flex-col items-center justify-center gap-4 hover:border-[#00BEBB] hover:bg-[#00BEBB]/5 transition-all duration-300",
        className,
      )}
    >
      <div className="w-full h-24 rounded-[20px] border-2 border-dashed border-[#00BEBB]/20 flex items-center justify-center group-hover:border-[#00BEBB]/40 transition-colors">
        <i className="icon-add text-[36px] text-[#00BEBB]" />
      </div>
      <span className="text-lg fs-[15px] font-bold text-primary-500 transition-colors">
        {label}
      </span>
    </button>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
