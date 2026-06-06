import { ApexOptions } from "apexcharts";

export const MEME_THEME: ApexOptions = {
  chart: {
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: "inherit",
    background: "transparent",
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  grid: {
    borderColor: "#E8EBEE",
    strokeDashArray: 4,
    xaxis: {
      lines: { show: false },
    },
    yaxis: {
      lines: { show: true },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    theme: "light",
    x: { show: true },
    y: {
      formatter: (val: number) => `${val.toLocaleString()}`,
    },
    style: {
      fontSize: "12px",
    },
  },
  markers: {
    size: 0,
    hover: {
      size: 5,
    },
  },
  colors: ["#39FF14", "#8B5CF6", "#38BDF8", "#F59E0B"], // Neon Green, Purple, Blue, Amber
};

export const STONKS_GRADIENT = {
  type: "gradient",
  gradient: {
    shade: "light",
    type: "vertical",
    shadeIntensity: 0.5,
    gradientToColors: ["#00E396"], // Another neon green
    inverseColors: true,
    opacityFrom: 0.8,
    opacityTo: 0.2,
    stops: [0, 100],
  },
};
