import React from "react";
import { CustomTable, CustomTableColumn, StatusStyle } from "@physio-connect-frontend/shared-ui"; // Adjust import paths

interface ResponsiveTableProps<T> {
  columns: CustomTableColumn[];
  data: T[];
  actions?: any;
  onActionClick?: (row: T) => void;
  pagination?: React.ReactNode;
  // Optional style overrides
  variant?: "default" | "bordered" | "shadow";
  statusStyle?: StatusStyle | undefined;
  language?: "fr" | "en" | undefined;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  actions,
  onActionClick,
  pagination,
  variant = "default",
  statusStyle = "progress-bar",
  language = "fr",
}: ResponsiveTableProps<T>) {
  return (
    <section>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <CustomTable
          columns={columns}
          data={data}
          actions={actions}
          variant={variant}
          statusStyle={statusStyle}
          language={language}
        />
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-5">
        {data.map((row, rowIndex) => (
          <div
            key={`mobile-row-${rowIndex}`}
            className="border border-border rounded-lg bg-white overflow-hidden"
          >
            {columns.map((column) => {
              const cellData = row[column.accessor as keyof T];
              const isNameColumn = column.key === "name";

              return (
                <div
                  key={column.key}
                  className={`px-5 py-3.5 flex items-center gap-5 ${
                    isNameColumn ? "" : "border-t border-t-border"
                  }`}
                >
                  {isNameColumn ? (
                    <div className="w-full flex items-center justify-between gap-5">
                      <div className="flex items-center gap-3">
                        {cellData?.image && (
                          <img
                            src={cellData.image}
                            alt={cellData.name || "avatar"}
                            className="sm:w-12 sm:h-12 w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="sm:text-xl text-base font-semibold text-foreground">
                            {cellData?.name || (typeof cellData === "string" ? cellData : "")}
                          </span>
                          {cellData?.description && (
                            <span className="sm:text-xs text-[10px] text-foreground-muted">
                              {cellData.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Action Button */}
                      {onActionClick && (
                        <button
                          onClick={() => onActionClick(row)}
                          className="w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-colors border-primary-400 text-primary-500 hover:bg-primary-50"
                        >
                          <i className="icon icon-eye" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-row justify-between w-full md:flex-col md:justify-start">
                       <span className="font-semibold text-sm">
                        {column.header}
                      </span>
                      <span className="text-sm text-foreground-muted font-medium">
                        {typeof cellData === "string" ? cellData : cellData?.name || ""}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pagination Slot */}
      {pagination && <div className="mt-4">{pagination}</div>}
    </section>
  );
}