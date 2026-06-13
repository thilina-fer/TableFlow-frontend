import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

interface LineChartProps {
  data: { label: string; value: number }[]
  xKey?: string
  yKey?: string
  color?: string
  height?: number
  formatY?: (val: number) => string
}

const CustomTooltip = ({ active, payload, label, formatY }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-xl rounded-lg p-3 text-sm">
        <p className="font-medium text-slate-900 mb-1">{label}</p>
        <p className="text-slate-600 font-semibold" style={{ color: payload[0].color }}>
          {formatY ? formatY(payload[0].value) : payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function LineChart({
  data,
  xKey = "label",
  yKey = "value",
  color = "#f97316", // brand orange default
  height = 300,
  formatY
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        style={{ height }} 
        className="flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200"
      >
        No data available
      </div>
    )
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12, fill: "#94a3b8" }} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#94a3b8" }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={formatY || ((val) => val.toString())}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip formatY={formatY} />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: color }}
            animationDuration={1000}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
