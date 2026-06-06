"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "../utils/cn";
import { ButtonProps, buttonVariants } from "./button";
import { useTranslation } from "react-i18next";
import "../i18n";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("inline-flex", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      "rounded-xl font-medium",
      isActive ? "border-gray-300 bg-transparent shadow-none" : "",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationGhostLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size,
      }),
      "rounded-xl font-medium hover:bg-transparent hover:text-primary",
      isActive ? "text-primary font-bold" : "text-gray-600",
      className,
    )}
    {...props}
  />
);
PaginationGhostLink.displayName = "PaginationGhostLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="icon"
      className={cn(
        "border border-gray-300 w-10 h-10 px-0 rounded-xl text-gray-500 hover:text-gray-900",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">{t("pagination.previous")}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="icon"
      className={cn(
        "border border-gray-300 w-10 h-10 px-0 rounded-xl text-gray-500 hover:text-gray-900",
        className,
      )}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">{t("pagination.next")}</span>
    </PaginationLink>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center text-gray-600 font-medium",
      className,
    )}
    {...props}
  >
    <span>...</span>
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

const PaginationSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, ...props }, ref) => (
  <div className="relative inline-flex items-center ml-2 group">
    <select
      ref={ref}
      className={cn(
        "h-10 w-[70px] appearance-none rounded-xl border border-gray-300 bg-white pl-3 pr-8 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    <div className="pointer-events-none absolute right-2.5 flex flex-col gap-0.5 text-gray-400 group-hover:text-gray-600 transition-colors">
      <ChevronRight className="h-3 w-3 -rotate-90" />
      <ChevronRight className="h-3 w-3 rotate-90" />
    </div>
  </div>
));
PaginationSelect.displayName = "PaginationSelect";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  handlePrevious?: () => void;
  handleNext?: () => void;
  lineView?: number[];
  selectedLineView?: number;
  onLineViewChange?: (value: number) => void;
  className?: string;
}

/**
 * A ready-to-use pagination component with numbers, ellipses, previous/next buttons,
 * and optional rows-per-page selector.
 */
function TablePagination({
  currentPage,
  totalPages,
  totalItems = 0,
  onPageChange,
  handlePrevious,
  handleNext,
  lineView = [5, 10, 15, 20, 25],
  selectedLineView = 10,
  onLineViewChange,
  className,
}: TablePaginationProps) {
  const { t } = useTranslation();

  // Compute which page numbers/ellipses to show
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const pages = getVisiblePages();

  const onPrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (handlePrevious) {
      handlePrevious();
    } else if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Calculate range display
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * selectedLineView + 1;
  const endItem = Math.min(currentPage * selectedLineView, totalItems);

  return (
    <div
      className={cn("mt-6 flex items-center sm:justify-between justify-end w-full", className)}
    >
      {/* Item count range (Left Side) */}
      <div className="text-sm font-medium text-dark-500 whitespace-nowrap hidden sm:flex items-center gap-1 ">
        <span className="text-gray-300 italic">
          {startItem}-{endItem}
        </span>
        <span>{t("pagination.of")}</span>
        <span className="text-gray-300 italic">{totalItems}</span>
        <span>{t("pagination.items")}</span>
      </div>

      <div className="flex items-center gap-4">
        <Pagination className="mx-0 justify-end w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={onPrevClick} />
            </PaginationItem>

            {pages.map((page, i) => (
              <PaginationItem key={i}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis className="hidden md:inline-flex" />
                ) : (
                  <PaginationGhostLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page as number);
                    }}
                    className="hidden md:inline-flex"
                  >
                    {page}
                  </PaginationGhostLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (handleNext) {
                    handleNext();
                  } else if (currentPage < totalPages) {
                    onPageChange(currentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {lineView && lineView.length > 0 && (
          <PaginationSelect
            value={selectedLineView}
            onChange={(e) => onLineViewChange?.(Number(e.target.value))}
          >
            {lineView.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </PaginationSelect>
        )}
      </div>
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationGhostLink,
  PaginationNext,
  PaginationPrevious,
  PaginationSelect,
  TablePagination,
};
