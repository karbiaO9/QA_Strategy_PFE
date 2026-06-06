"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Checkbox } from "./checkbox";
import { cn } from "../utils/cn";
import { Eye, Download, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../i18n";

// ─── StatusStyle ──────────────────────────────────────────────────────────────
/**
 * Visual style used to render a status cell.
 *
 * | value              | appearance                                              |
 * |--------------------|---------------------------------------------------------|
 * | "circle-button"    | outlined pill with a small dot inside|
 * | "rounded-button"   | solid filled pill with white text                       |
 * | "circle-with-text" | small dot + plain text)            |
 * | "square-with-label"| small square + plain text)        |
 * | "progress-bar"     | horizontal bar, no text)       |
 */
export type StatusStyle =
  | "circle-button"
  | "rounded-button"
  | "circle-with-text"
  | "square-with-label"
  | "progress-bar";

// ─── COLOR_MAP ────────────────────────────────────────────────────────────────
/**
 * Pass a single color name everywhere — the component derives all
 * needed Tailwind classes from this map.
 *
 * "primary"   uses the brand primary   (#00BEBB)
 * "secondary" uses the brand secondary (#9A91E4)
 * "red"       uses the brand red       (#FF383C)
 * "gray"      uses the brand gray      (#80858A)
 */
export type ColorName =
  | "primary"
  | "secondary"
  | "red"
  | "gray"
  | "blue"
  | "yellow"
  | "green"
  | "teal"
  | "orange"
  | "pink";

export interface ColorTokens {
  bg: string;
  text: string;
  border: string;
  lightBg: string;
}

export const COLOR_MAP: Record<ColorName, ColorTokens> = {
  // ── Brand tokens ────────────────────────────────────────────────────────
  primary:   { bg: "bg-primary-500",   text: "text-primary-700",   border: "border-primary-400",   lightBg: "bg-primary-50"   },
  secondary: { bg: "bg-secondary-500", text: "text-secondary-700", border: "border-secondary-400", lightBg: "bg-secondary-50" },
  red:       { bg: "bg-red-500",       text: "text-red-600",       border: "border-red-400",       lightBg: "bg-red-50"       },
  gray:      { bg: "bg-gray-400",      text: "text-gray-600",      border: "border-gray-300",      lightBg: "bg-gray-100"     },

  // ── Extra utility colours ───────────────────────────────────────────────
  blue:   { bg: "bg-blue-500",   text: "text-blue-600",   border: "border-blue-400",   lightBg: "bg-blue-50"   },
  yellow: { bg: "bg-yellow-400", text: "text-yellow-700", border: "border-yellow-400", lightBg: "bg-yellow-50" },
  green:  { bg: "bg-green-500",  text: "text-green-600",  border: "border-green-400",  lightBg: "bg-green-50"  },
  teal:   { bg: "bg-teal-500",   text: "text-teal-600",   border: "border-teal-400",   lightBg: "bg-teal-50"   },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-400", lightBg: "bg-orange-50" },
  pink:   { bg: "bg-pink-500",   text: "text-pink-600",   border: "border-pink-400",   lightBg: "bg-pink-50"   },
};

/** Resolve a ColorName to its tokens (returns gray tokens as fallback). */
const resolveColor = (color: string): ColorTokens =>
  COLOR_MAP[color as ColorName] ?? COLOR_MAP.gray;

/**
 * Utility exported so page-level `render` props can build consistent pills.
 * @example
 * render: (value) => <span className={pillClasses("blue")}>{value}</span>
 */
export const pillClasses = (color: ColorName | string): string => {
  const t = resolveColor(color);
  return cn(
    "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium",
    t.lightBg,
    t.text,
    "border",
    t.border,
  );
};

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * StatusConfig — display text and colour for a status key.
 * Set `color` to a simple color name: "primary", "secondary", "red", etc.
 * The component derives all Tailwind classes via COLOR_MAP.
 */
export interface StatusConfig {
  /**
   * Simple color name — e.g. "primary", "red", "gray".
   * All Tailwind classes (bg, border, text) are derived automatically.
   */
  color: ColorName | string;
  textFr: string;
  textEn: string;
  /** Only used when statusStyle === "progress-bar" */
  percentage?: number;
}

/**
 * StatusObject (legacy / inline)
 * Carry the status key + display name inline in the row data.
 * Visual style comes from the `statusStyle` prop.
 */
export interface StatusObject {
  key: string;
  name: string;
}

export interface ActionObject {
  key: string;
  icon: "eye" | "download" | "edit" | "delete" | "more";
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface NameColumn {
  image?: string;
  name: string;
  description?: string;
}

export interface CustomTableColumn {
  key: string;
  header: string;
  accessor: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  config?: {
    key?: string;
    /** Per-column statusStyle — takes priority over the table-level prop */
    statusStyle?: StatusStyle;
  };
}

export interface TableAction {
  key: string;
  icon: "eye" | "download" | "edit" | "delete" | "more";
  label?: string;
  handleClick: (row: Record<string, any>) => void;
}

export interface CustomTableProps {
  columns: CustomTableColumn[];
  data: Record<string, any>[];
  variant?: "default" | "bordered" | "shadow";
  statusConfig?: Record<string, StatusConfig>;
  /**
   * Controls how ALL status cells in this table are rendered.
   * Can be overridden per column via `column.config.statusStyle`.
   *
   * • "circle-button"    → outlined pill with dot
   * • "rounded-button"   → solid pill badge
   * • "circle-with-text" → dot + text
   * • "square-with-label"→ square + text
   * • "progress-bar"     → horizontal bar
   */
  statusStyle?: StatusStyle;
  language?: "en" | "fr";
  actions?: TableAction[];
  /**
   * When true, prepends a checkbox column.
   * `onSelectionChange` fires with the array of selected row indices each time
   * the selection changes.
   */
  selectable?: boolean;
  onSelectionChange?: (selectedIndices: number[]) => void;
  statusRenderer?: (
    status: string | StatusObject,
    config?: Record<string, StatusConfig>,
  ) => React.ReactNode;
  nameRenderer?: (name: NameColumn) => React.ReactNode;
  actionsRenderer?: (actions: ActionObject[]) => React.ReactNode;
}

// ─── DEFAULT_STATUS_CONFIG ────────────────────────────────────────────────────
// Now uses simple color names — no more manual Tailwind class strings.

export const DEFAULT_STATUS_CONFIG: Record<string, StatusConfig> = {
  new:       { color: "secondary", textFr: "Nouveau",     textEn: "New" },
  active:    { color: "primary",   textFr: "Actif",       textEn: "Active" },
  inactive:  { color: "gray",      textFr: "Inactif",     textEn: "Inactive" },
  paid:      { color: "primary",   textFr: "Payée",       textEn: "Paid" },
  pending:   { color: "yellow",    textFr: "En attente",  textEn: "Pending" },
  cancelled: { color: "red",       textFr: "Annulée",     textEn: "Cancelled" },
};

// ─── Icon map ─────────────────────────────────────────────────────────────────

const iconComponentMap: Record<string, React.ReactNode> = {
  eye: <i className="icon icon-eye" />,
  download: <Download className="w-4 h-4" />, // Assuming we keep download from lucide for now as it's not in the CSS list
  edit: <i className="icon icon-edit" />,
  delete: <i className="icon icon-delete" />,
  more: <MoreHorizontal className="w-4 h-4" />,
};

// ─── Status Renderers ─────────────────────────────────────────────────────────

/**
 * circle-button — rounded pill with light background fill + border + dot.
 * Active: light primary bg, primary border, primary dot, primary text.
 * Inactive: light gray bg, gray border, gray dot, gray text.
 */
const CircleButtonRenderer = ({
  text,
  tokens,
}: {
  text: string;
  tokens: ColorTokens;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold",
      tokens.lightBg,   // ← light background fill (e.g. bg-primary-50)
      tokens.border,    // border colour
      tokens.text,      // text colour
    )}
  >
    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", tokens.bg)} />
    {text}
  </span>
);

/** rounded-button — solid filled pill with white text */
const RoundedButtonRenderer = ({
  text,
  tokens,
}: {
  text: string;
  tokens: ColorTokens;
}) => (
  <span
    className={cn(
      "px-3 py-1 rounded-full text-xs font-medium text-white",
      tokens.bg,
    )}
  >
    {text}
  </span>
);

/** circle-with-text — small filled circle + plain text */
const CircleWithTextRenderer = ({
  text,
  tokens,
}: {
  text: string;
  tokens: ColorTokens;
}) => (
  <div className="flex items-center gap-2">
    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", tokens.bg)} />
    <span className="text-[16px] font-medium text-[#070C0C]">{text}</span>
  </div>
);

/** square-with-label — small square + plain text */
const SquareWithLabelRenderer = ({
  text,
  tokens,
}: {
  text: string;
  tokens: ColorTokens;
}) => (
  <div className="flex items-center gap-2">
    <div className={cn("w-3 h-3 rounded-sm flex-shrink-0", tokens.bg)} />
    <span className="text-[16px] font-medium text-[#070C0C]">{text}</span>
  </div>
);

/** progress-bar — horizontal bar */
const ProgressBarRenderer = ({
  text,
  tokens,
  percentage = 65,
}: {
  text: string;
  tokens: ColorTokens;
  percentage?: number;
}) => (
  <div className="flex flex-col gap-1 w-36">
    {text && <span className="text-[16px] font-medium text-[#070C0C]">{text}</span>}
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={cn("h-2 rounded-full", tokens.bg)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

// ─── Dispatch: pick renderer from style ───────────────────────────────────────

function renderByStyle(
  style: StatusStyle | undefined,
  text: string,
  colorName: string,
  percentage?: number,
): React.ReactNode {
  const tokens = resolveColor(colorName);
  switch (style) {
    case "circle-button":
      return <CircleButtonRenderer text={text} tokens={tokens} />;
    case "rounded-button":
      return <RoundedButtonRenderer text={text} tokens={tokens} />;
    case "square-with-label":
      return <SquareWithLabelRenderer text={text} tokens={tokens} />;
    case "progress-bar":
      return (
        <ProgressBarRenderer
          text={text}
          tokens={tokens}
          percentage={percentage ?? 65}
        />
      );
    case "circle-with-text":
    default:
      return <CircleWithTextRenderer text={text} tokens={tokens} />;
  }
}

// ─── DefaultStatusRenderer ────────────────────────────────────────────────────

const DefaultStatusRenderer = ({
  status,
  config,
  language = "en",
  statusStyle,
}: {
  status: string | StatusObject;
  config?: Record<string, StatusConfig>;
  language?: "en" | "fr";
  statusStyle?: StatusStyle;
}) => {
  const mergedConfig = { ...DEFAULT_STATUS_CONFIG, ...config };

  if (typeof status === "string") {
    const statusData = mergedConfig[status];
    if (!statusData) {
      return <span className="text-[16px] text-[#070C0C]">{status}</span>;
    }
    const text = language === "fr" ? statusData.textFr : statusData.textEn;
    return renderByStyle(
      statusStyle,
      text,
      statusData.color,
      statusData.percentage,
    );
  }

  // StatusObject (legacy)
  const statusData = mergedConfig[status.key];
  return renderByStyle(
    statusStyle,
    status.name,
    statusData?.color ?? "gray",
    statusData?.percentage,
  );
};

// ─── DefaultNameRenderer ──────────────────────────────────────────────────────

const DefaultNameRenderer = ({ name }: { name: NameColumn }) => (
  <div className="flex items-center gap-3">
    {name.image && (
      <img
        src={name.image}
        alt={name.name}
        className="2xl:w-10 2xl:h-10 w-8 h-8 rounded-lg object-cover flex-shrink-0"
      />
    )}
    <div className="flex flex-col">
      <span className="font-semibold text-[#070C0C]">{name.name}</span>
      {name.description && (
        <span className="2xl:text-xs text-[10px] text-gray-400">{name.description}</span>
      )}
    </div>
  </div>
);

// ─── DefaultActionsRenderer ───────────────────────────────────────────────────

// eye = primary, download = primary, edit = secondary, delete = red
const DEFAULT_ACTION_STYLES: Record<string, string> = {
  eye:      "border-primary-400   text-primary-500   hover:bg-primary-50",
  download: "border-primary-400   text-primary-500   hover:bg-primary-50",
  edit:     "border-secondary-300 text-secondary-500 hover:bg-secondary-50",
  delete:   "border-red-400       text-red-500       hover:bg-red-50",
  more:     "border-gray-300      text-gray-500      hover:bg-gray-50",
};

const DefaultActionsRenderer = ({ actions }: { actions: ActionObject[] }) => (
  <div className="flex gap-2">
    {actions.map((action) => (
      <button
        key={action.key}
        onClick={action.handleClick}
        className={cn(
          // rounded square shape matching the image (not full circle)
          "w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-colors",
          DEFAULT_ACTION_STYLES[action.icon] ??
            "border-gray-300 text-gray-500 hover:bg-gray-50",
        )}
        title={action.key}
      >
        {iconComponentMap[action.icon]}
      </button>
    ))}
  </div>
);

// ─── renderCellContent ────────────────────────────────────────────────────────

const renderCellContent = (
  cellValue: any,
  row: any,
  column: CustomTableColumn,
  statusConfig?: Record<string, StatusConfig>,
  language: "en" | "fr" = "en",
  render?: (value: any, row: any) => React.ReactNode,
  statusRenderer?: (
    status: string | StatusObject,
    config?: Record<string, StatusConfig>,
  ) => React.ReactNode,
  nameRenderer?: (name: NameColumn) => React.ReactNode,
  actionsRenderer?: (actions: ActionObject[]) => React.ReactNode,
  tableActions?: TableAction[],
  tableStatusStyle?: StatusStyle,
): React.ReactNode => {
  if (render) return render(cellValue, row);

  // Actions column
  if (column.key === "actions" && tableActions) {
    const actionObjects: ActionObject[] = tableActions.map((action) => ({
      key: action.key,
      icon: action.icon,
      handleClick: () => action.handleClick(row),
    }));
    return actionsRenderer ? (
      actionsRenderer(actionObjects)
    ) : (
      <DefaultActionsRenderer actions={actionObjects} />
    );
  }

  // Effective statusStyle: column override > table prop
  const effectiveStatusStyle: StatusStyle | undefined =
    column.config?.statusStyle ?? tableStatusStyle;

  // Status string key
  if (typeof cellValue === "string" && column.key === "status") {
    return statusRenderer ? (
      statusRenderer(cellValue, statusConfig)
    ) : (
      <DefaultStatusRenderer
        status={cellValue}
        config={statusConfig}
        language={language}
        statusStyle={effectiveStatusStyle}
      />
    );
  }

  // StatusObject (legacy)
  if (
    cellValue &&
    typeof cellValue === "object" &&
    "key" in cellValue &&
    "name" in cellValue &&
    !Array.isArray(cellValue)
  ) {
    return statusRenderer ? (
      statusRenderer(cellValue as StatusObject, statusConfig)
    ) : (
      <DefaultStatusRenderer
        status={cellValue as StatusObject}
        config={statusConfig}
        language={language}
        statusStyle={effectiveStatusStyle}
      />
    );
  }

  // Name object
  if (
    cellValue &&
    typeof cellValue === "object" &&
    "name" in cellValue &&
    !Array.isArray(cellValue)
  ) {
    return nameRenderer ? (
      nameRenderer(cellValue as NameColumn)
    ) : (
      <DefaultNameRenderer name={cellValue as NameColumn} />
    );
  }

  // Actions array (legacy)
  if (Array.isArray(cellValue) && cellValue.length > 0 && cellValue[0].icon) {
    return actionsRenderer ? (
      actionsRenderer(cellValue as ActionObject[])
    ) : (
      <DefaultActionsRenderer actions={cellValue as ActionObject[]} />
    );
  }

  return cellValue ?? "-";
};

// ─── CustomTable ──────────────────────────────────────────────────────────────

/**
 * CustomTable
 *
 * ## Variants
 * | value      | appearance                              |
 * |------------|-----------------------------------------|
 * | "default"  | Borderless clean rows                   |
 * | "bordered" | Light border around the whole table     |
 * | "shadow"   | Card-like elevation, rounded corners    |
 *
 * ## statusStyle prop
 * | value               | visual
 * |---------------------|-------------------------------------
 * | "circle-button"     | outlined pill + dot + text
 * | "square-with-label" | coloured square + text
 * | "progress-bar"      | horizontal bar (no text)
 * | "circle-with-text"  | coloured circle + text
 * | "rounded-button"    | solid filled pill
 *
 * ## selectable prop
 * Adds a checkbox column for row selection.
 * Header checkbox selects / deselects all rows (indeterminate when partial).
 * `onSelectionChange(indices)` fires on every change.
 *
 */
export const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  data,
  variant = "default",
  statusConfig,
  statusStyle,
  language = "en",
  actions,
  selectable = false,
  onSelectionChange,
  statusRenderer,
  nameRenderer,
  actionsRenderer,
}) => {
  // ── Selection state ──
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(
    new Set(),
  );

  const allSelected = selectedRows.size === data.length && data.length > 0;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleAll = () => {
    const next = allSelected
      ? new Set<number>()
      : new Set(data.map((_, i) => i));
    setSelectedRows(next);
    onSelectionChange?.(Array.from(next));
  };

  const toggleRow = (index: number) => {
    const next = new Set(selectedRows);
    next.has(index) ? next.delete(index) : next.add(index);
    setSelectedRows(next);
    onSelectionChange?.(Array.from(next));
  };

  const { t } = useTranslation();

  // ── Variant classes ──
  const variantClasses: Record<string, string> = {
    default: "",
    bordered: "border border-border rounded-lg overflow-hidden",
    shadow: "shadow-md rounded-xl overflow-hidden",
  };

  // ── Build display columns ──
  const displayColumns: CustomTableColumn[] = actions
    ? [...columns, { key: "actions", header: "", accessor: "actions" }]
    : columns;

  return (
    <div className={cn("w-full", variantClasses[variant])}>
      <Table>
        <TableHeader className="bg-app-surface">
          <TableRow className="border-none">
            {/* Checkbox header */}
            {selectable && (
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}

            {displayColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-semibold text-[#414246] 2xl:text-sm text-xs",
                  column.width && `w-[${column.width}]`,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={`row-${rowIndex}-${JSON.stringify(row).substring(0, 20)}`}
              className={cn(
                "border-gray-100 transition-colors",
                selectedRows.has(rowIndex) ? "bg-primary-50" : "hover:bg-gray-50",
              )}
            >
              {/* Checkbox cell */}
              {selectable && (
                <TableCell className="w-10 pl-4">
                  <Checkbox
                    checked={selectedRows.has(rowIndex)}
                    onCheckedChange={() => toggleRow(rowIndex)}
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </TableCell>
              )}

              {displayColumns.map((column) => (
                <TableCell key={`${rowIndex}-${column.key}`} className="py-4 2xl:text-base text-sm text-[#070C0C]">
                  {renderCellContent(
                    row[column.accessor],
                    row,
                    column,
                    statusConfig,
                    language,
                    column.render,
                    statusRenderer,
                    nameRenderer,
                    actionsRenderer,
                    actions,
                    statusStyle,
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomTable;
