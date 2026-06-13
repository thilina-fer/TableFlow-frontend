import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

interface BarChartProps {
  data: { label: string; value: number }[]
  xKey?: string
  yKey?: string
  color?: string
  height?: number
  formatY?: (val: number) => string
  horizontal?: boolean
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

export default function BarChart({
  data,
  xKey = "label",
  yKey = "value",
  color = "#f97316", // brand orange default
  height = 300,
  formatY,
  horizontal = false
}: BarChartProps) {
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
        <RechartsBarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: horizontal ? 30 : 0, bottom: 0 }}
          layout={horizontal ? "vertical" : "horizontal"}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={!horizontal} vertical={horizontal} />
          
          {horizontal ? (
            <>
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: "#94a3b8" }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={formatY || ((val) => val.toString())}
              />
              <YAxis 
                dataKey={xKey} 
                type="category"
                tick={{ fontSize: 12, fill: "#94a3b8" }} 
                tickLine={false}
                axisLine={false}
              />
            </>
          ) : (
            <>
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
            </>
          )}

          <Tooltip content={<CustomTooltip formatY={formatY} />} cursor={{ fill: "#f8fafc" }} />
          <Bar 
            dataKey={yKey} 
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} 
            animationDuration={1000}
            barSize={horizontal ? 24 : 32}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
