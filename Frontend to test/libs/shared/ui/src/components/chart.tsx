"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "../utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { DashboardCard } from "./card";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center",
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              },
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center",
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref,
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className,
        )}
      >
        {payload
          .filter((item) => item.type !== "none")
          .map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                {itemConfig?.label}
              </div>
            );
          })}
      </div>
    );
  },
);
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  title: string;
  value: string | number;
  trendValue: string;
  trendLabel: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  trendValue,
  trendLabel,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="text-[15px] font-medium text-gray-600 mb-3">{title}</div>
      <div className="text-4xl font-semibold text-gray-900 mb-4">{value}</div>
      <div className="flex items-center text-sm font-medium">
        <TrendingUp className="mr-1.5 h-4 w-4 text-success-500" />
        <span className="text-success-500 mr-1.5">{trendValue}</span>
        <span className="text-gray-500">{trendLabel}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME CARD (Dropdown Selection)
// ─────────────────────────────────────────────────────────────────────────────

export interface TimeCardProps {
  value: string | React.ReactNode;
  subtitle: string;
  options: { label: string; value: string }[];
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
  className?: string;
}

export function TimeCard({
  value,
  subtitle,
  options,
  selectedOption,
  onOptionChange,
  className,
}: TimeCardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative flex flex-col",
        className,
      )}
    >
      <div className="absolute top-4 right-4">
        {options && options.length > 0 && (
          <Select
            value={selectedOption}
            onValueChange={(val) => onOptionChange && onOptionChange(val)}
          >
            <SelectTrigger className="w-auto h-8 px-3 rounded-lg border-gray-200 text-gray-400 font-medium text-sm bg-white focus:ring-1 focus:ring-primary-500">
              <SelectValue placeholder="Select Option" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Spacing to ensure the giant text doesn't overlap the top-right select if it expands */}
      <div className="mt-8">
        <div className="text-[2.5rem] font-bold text-[#1e1e1e] leading-none mb-3 tracking-tight">
          {value}
        </div>
        <div className="text-[17px] font-medium text-gray-500 tracking-tight">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY EXPENSES CHART (Stacked Bar)
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyExpensesSeries {
  key: string;
  label: string;
  color: string;
}

export interface DailyExpensesProps {
  data: any[];
  series: DailyExpensesSeries[];
  title?: string;
  subtitle?: string;
  xAxisKey?: string;
  yAxisTicks?: number[];
  yAxisDomain?: [number, number];
  warningText?: React.ReactNode;
  className?: string;
}

export function DailyExpensesChart({
  data,
  series,
  title,
  subtitle,
  xAxisKey = "date",
  yAxisTicks = [0, 4500, 9000, 13500, 18000],
  yAxisDomain = [0, 18000],
  warningText,
  className,
}: DailyExpensesProps) {
  const chartOptions: any = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: data.map((d) => d[xAxisKey]),
      axisBorder: { show: true, color: "#E8EAEB" },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#80858A", fontSize: "12px" },
      },
    },
    yaxis: {
      min: yAxisDomain[0],
      max: yAxisDomain[1],
      labels: {
        style: { colors: "#80858A", fontSize: "12px" },
      },
    },
    colors: series.map((s) => s.color),
    grid: {
      borderColor: "#E8EAEB",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: 600,
      markers: { radius: 4 },
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
    },
  };

  const chartSeries = series.map((s) => ({
    name: s.label,
    data: data.map((d) => d[s.key]),
  }));

  return (
    <div
      className={cn(
        "rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col",
        className,
      )}
    >
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
          <div>
            {title && (
              <h3 className="text-[1.15rem] font-bold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[13px] text-gray-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="w-full h-[300px]">
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height="100%"
        />
      </div>

      {warningText && (
        <div className="mt-8 text-[11px] text-gray-400">{warningText}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN STATS (Lists & Horizontal progress bars)
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanData {
  name: string;
  value: number;
  color: string;
}

export interface PlanStatsProps {
  data: PlanData[];
  titleLeft?: string;
  titleRight?: string;
  maxAmount?: number;
  className?: string;
}

export function PlanStats({
  data,
  titleLeft = "Abonnées par plan",
  titleRight = "Revenus par plan",
  maxAmount = 300,
  showOnlyRight = false,
  className,
}: PlanStatsProps & { showOnlyRight?: boolean }) {
  const RightSection = (
    <div className="rounded-[20px] border border-gray-300 bg-white p-4">
      <h3 className="text-base font-bold text-gray-900 mb-8">{titleRight}</h3>
      <div className="space-y-7">
        {data.map((item) => (
          <div
            key={`rev-${item.name}`}
            className="flex items-center w-full gap-5 text-[14px] font-bold"
          >
            <span style={{ color: item.color }} className="w-[100px] shrink-0">
              {item.name}
            </span>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-gray-50">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: item.color,
                    width: `${Math.min((item.value / maxAmount) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-gray-900 w-10 text-right font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (showOnlyRight) {
    return <div className={className}>{RightSection}</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* Abonnées par plan */}
      <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)]">
        <h3 className="text-base font-bold text-gray-900 mb-8">{titleLeft}</h3>
        <div className="space-y-7">
          {data.map((item) => (
            <div
              key={`ab-${item.name}`}
              className="flex items-center justify-between text-[14px] font-bold"
            >
              <span style={{ color: item.color }}>{item.name}</span>
              <span className="text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenus par plan */}
      {RightSection}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY REVENUE CHART (Area)
// ─────────────────────────────────────────────────────────────────────────────

export interface MonthlyRevenueSeries {
  key: string;
  label: string;
  color: string;
}

export interface MonthlyRevenueProps {
  data: any[];
  series: MonthlyRevenueSeries;
  title?: string;
  tabs?: string[];
  xAxisKey?: string;
  yAxisTicks?: number[];
  yAxisDomain?: [number, number];
  height?: number | string;
  className?: string;
}

export function MonthlyRevenueChart({
  data,
  series,
  title,
  tabs = ["7 Jours", "30 Jours", "6 mois", "12 mois"],
  xAxisKey = "month",
  yAxisTicks = [10000, 15000, 20000, 25000, 30000],
  yAxisDomain = [10000, 30000],
  height = 300,
  className,
}: MonthlyRevenueProps) {
  const [activeTab, setActiveTab] = React.useState(
    tabs.length > 0 ? tabs[tabs.length - 1] : "",
  );

  const chartOptions: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 4,
      colors: [series.color],
    },
    markers: {
      size: 6,
      colors: ["#fff"],
      strokeColors: series.color,
      strokeWidth: 3,
      hover: {
        size: 8,
      },
    },
    tooltip: {
      theme: "light",
      x: { show: true },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.25,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#B4D4FD",
            opacity: 0.45,
          },
          {
            offset: 100,
            color: "#FDFDFE",
            opacity: 0.25,
          },
        ],
      },
    },
    xaxis: {
      categories: data.map((d) => d[xAxisKey]),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94A3B8", fontSize: "12px", fontWeight: 500 },
      },
    },
    yaxis: {
      min: yAxisDomain[0],
      max: yAxisDomain[1],
      labels: {
        style: { colors: "#94A3B8", fontSize: "12px", fontWeight: 500 },
        formatter: (value: number) => `${Math.round(value / 1000)}k€`,
      },
    },
    colors: [series.color],
    grid: {
      borderColor: "#F1F5F9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
  };

  const chartSeries = [
    {
      name: series.label,
      data: data.map((d) => d[series.key]),
    },
  ];

  return (
    <div
      className={cn(
        "rounded-[20px] border border-gray-300 bg-white p-4 flex flex-col",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 px-2">
        {title && (
          <h3 className="text-[15px] font-bold text-dark tracking-tight">
            {title}
          </h3>
        )}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center border border-gray-100/80 rounded-[10px]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-[10px] text-[13px] font-bold transition-all duration-300 whitespace-nowrap",
                  activeTab === tab
                    ? "border border-sidebar text-sidebar bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 border border-transparent",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <ReactApexChart
          options={{
            ...chartOptions,
            dataLabels: {
              enabled: false,
            },
            markers: {
              ...chartOptions.markers,
              size: 0,
              hover: {
                size: 6,
              },
            },
            tooltip: {
              ...chartOptions.tooltip,
              y: {
                formatter: (val: number) => `${val.toLocaleString()}€`,
                title: {
                  formatter: () => "Revenu Mensuel:",
                },
              },
            },
            fill: {
              ...chartOptions.fill,
              type: "gradient",
              gradient: {
                ...chartOptions.fill.gradient,
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 100],
                colorStops: [
                  {
                    offset: 0,
                    color: series.color,
                    opacity: 0.4,
                  },
                  {
                    offset: 100,
                    color: "#fff",
                    opacity: 0,
                  },
                ],
              },
            },
          }}
          series={chartSeries}
          type="area"
          height="100%"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STAT CARD V2
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  badge?: React.ReactNode;
  variant?: "standard" | "minimal";
  showGradient?: boolean;
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  badge,
  variant = "minimal",
  showGradient = true,
  className,
}: DashboardStatCardProps) {
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "rounded-[16px] p-5 border border-gray-300 bg-white group transition-all duration-300 relative overflow-hidden",
          className,
        )}
      >
        <div className="flex flex-col flex-1 justify-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-primary-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    className: cn((icon.props as any).className, "w-10 h-10"),
                  })
                : icon}
            </div>
            <div className="text-[48px] font-bold text-gray-900 leading-none tracking-tight">
              {value}
            </div>
          </div>
          <div className="text-[24px] font-semibold text-gray-400 tracking-tight pl-12">
            {title}
          </div>
        </div>
        {badge && <div className="absolute top-4 right-4">{badge}</div>}
        {showGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#5446D6] to-[#00BEBB]" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[20px] p-6 flex items-center gap-5 relative overflow-hidden bg-white border border-gray-200",
        className,
      )}
    >
      <div className="flex flex-col flex-1 justify-center gap-5 w-full">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "w-[64px] h-[64px] flex items-center justify-center rounded-2xl shrink-0 transition-transform hover:scale-105 duration-300",
            )}
            style={{ backgroundColor: iconBgColor, color: iconTextColor }}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, {
                  className: cn((icon.props as any).className, "w-8 h-8"),
                })
              : icon}
          </div>
          <div className="text-[32px] font-bold text-gray-900 leading-none tracking-tight">
            {value}
          </div>
        </div>
        <div className="text-[15px] font-semibold text-gray-400 tracking-tight pl-[84px]">
          {title}
        </div>
      </div>
      {badge && <div className="absolute top-4 right-4">{badge}</div>}
      {showGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#5446D6] to-[#00BEBB]" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY METRICS CHART (Bar + Line)
// ─────────────────────────────────────────────────────────────────────────────

export interface MonthlyMetricsProps {
  data: any[];
  title?: string;
  barSeries: { key: string; label: string; color: string };
  lineSeries: { key: string; label: string; color: string };
  tabs?: string[];
  xAxisKey?: string;
  className?: string;
}

export function MonthlyMetricsChart({
  data,
  title,
  barSeries,
  lineSeries,
  tabs = ["6 derniers mois"],
  xAxisKey = "month",
  className,
}: MonthlyMetricsProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0] || "");

  const chartOptions: any = {
    chart: {
      type: "line",
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    stroke: {
      width: [0, 4],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 8,
        borderRadiusApplication: "end",
      },
    },
    fill: {
      type: "solid",
      opacity: 1,
    },
    labels: data.map((d) => d[xAxisKey]),
    markers: {
      size: 5,
      colors: [lineSeries.color],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 7 },
    },
    xaxis: {
      type: "category",
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94A3B8", fontWeight: 500 },
      },
    },
    yaxis: [
      {
        labels: {
          style: { colors: "#94A3B8" },
        },
      },
      {
        opposite: true,
        labels: {
          style: { colors: "#94A3B8" },
          formatter: (val: number) => `${val}%`,
        },
      },
    ],
    colors: [barSeries.color, lineSeries.color],
  };

  const series = [
    {
      name: barSeries.label,
      type: "column",
      data: data.map((d) => d[barSeries.key]),
    },
    {
      name: lineSeries.label,
      type: "line",
      data: data.map((d) => d[lineSeries.key]),
    },
  ];

  return (
    <DashboardCard
      title={title || ""}
      extra={
        tabs.length > 0 && (
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-auto h-8 px-3 rounded-lg border-gray-200 text-gray-500 font-medium text-[13px] bg-white focus:ring-1 focus:ring-primary-500">
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab} value={tab}>
                  {tab}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      className={className}
    >
      <div className="flex-1 w-full min-h-0 mt-4 relative">
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="line"
          height="100%"
        />
      </div>
    </DashboardCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM HEALTH CHART (Gauge + Sparkline)
// ─────────────────────────────────────────────────────────────────────────────

export interface PlatformHealthProps {
  title: string;
  gaugeValue: number; // out of 100
  gaugeDesc: string;
  gaugeLabel: string;
  gaugeColor: string;
  sparklineData: any[];
  sparklineKey: string;
  sparklineColor?: string;
  warningText: string;
  warningIconColor?: string;
  warningChevronColor?: string;
  className?: string;
}

export function PlatformHealthChart({
  title,
  gaugeValue,
  gaugeDesc,
  gaugeLabel,
  gaugeColor,
  sparklineData,
  sparklineKey,
  sparklineColor = "#38BDF8", // Default blue/cyan
  warningText,
  warningIconColor = "#F59E0B", // Default orange
  warningChevronColor = "#8B5CF6", // Default purple
  className,
}: PlatformHealthProps) {
  const radialBarOptions: any = {
    chart: {
      type: "radialBar",
      offsetY: -35,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -110,
        endAngle: 110,
        hollow: {
          size: "65%",
        },
        track: {
          background: "#F1F5F9",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 10,
            fontSize: "30px",
            fontWeight: "800",
            color: "#1E293B",
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
    grid: { padding: { top: 0, bottom: 0 } },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: [gaugeColor],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    labels: [gaugeLabel],
    colors: [gaugeColor],
  };

  const sparklineOptions: any = {
    chart: {
      type: "area",
      height: 160,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    stroke: { curve: "smooth", width: 2.5, colors: [sparklineColor] },
    markers: {
      size: 5,
      colors: ["#FFF"],
      strokeColors: sparklineColor,
      strokeWidth: 2,
      hover: { size: 7 },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },
    colors: [sparklineColor],
    grid: {
      show: true,
      borderColor: "#F1F5F9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 10, right: 10, top: 0, bottom: 0 },
    },
    yaxis: {
      show: true,
      labels: {
        style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
        formatter: (val: number) => `${Math.round(val)}%`,
      },
      tickAmount: 3,
    },
    tooltip: { x: { show: false }, y: { title: { formatter: () => "" } } },
  };

  const sparklineSeries = [
    {
      name: "Usage",
      data: sparklineData.map((d) => d[sparklineKey]),
    },
  ];

  return (
    <DashboardCard
      title={title}
      className={cn("h-[400px] rounded-[32px] overflow-hidden", className)}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-1 items-stretch mb-4 min-h-0">
          {/* Left Side: Semi-Circle Gauge */}
          <div className="relative w-[43%] flex flex-col items-center justify-center border-r border-slate-100/60 pr-6">
            <div className="w-full h-[170px] mt-1">
              <ReactApexChart
                options={radialBarOptions}
                series={[gaugeValue]}
                type="radialBar"
                height={260}
              />
            </div>

            <div className="absolute inset-x-0 bottom-2 flex flex-col items-center text-center pointer-events-none">
              <span className="text-[12px] text-[#475569] font-medium leading-tight max-w-[140px]">
                Bara d'utilisation <br /> de jeunes
              </span>
            </div>
          </div>

          {/* Right Side: Sparkline + Global usage number */}
          <div className="w-[57%] flex flex-col pl-6 py-2">
            <div className="flex items-center justify-between w-full mb-4 pr-4">
              <span className="text-[20px] font-medium text-slate-700 tracking-tight">
                {gaugeLabel}
              </span>
              <span className="text-[40px] font-semibold text-slate-800 tracking-tighter leading-none">
                {gaugeValue}%
              </span>
            </div>
            <div className="flex-1 w-full relative min-h-[110px] bg-[#FAFBFD]/50 rounded-[20px] border border-[#F1F5F9] p-3">
              <ReactApexChart
                options={sparklineOptions}
                series={sparklineSeries}
                type="area"
                height="100%"
              />
            </div>
          </div>
        </div>

        {/* Warning Alert Box bottom */}
        {warningText && (
          <div className="mt-auto w-full flex items-center justify-between rounded-[14px] border border-[#F1F5F9] bg-white p-2.5 cursor-pointer hover:bg-slate-50/50 transition-all duration-200 group/alert shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#D97706] shrink-0 bg-[#FEF3C7]/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className="text-[13px] font-bold text-gray-800 tracking-tight">
                {warningText}
              </span>
            </div>
            <ChevronDown
              className="h-5 w-5 rotate-[-90deg] group-hover/alert:translate-x-0.5 transition-transform"
              style={{ color: warningChevronColor }}
            />
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
