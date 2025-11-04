"use client"

interface BarChartData {
  month: string
  المخصصات: number
  الأوامر: number
}

interface SimpleBarChartProps {
  data: BarChartData[]
  height?: number
}

export function SimpleBarChart({ data, height = 350 }: SimpleBarChartProps) {
  if (!data.length) return null

  const maxValue = Math.max(...data.flatMap((d) => [d.المخصصات, d.الأوامر]))
  const barWidth = 40
  const gap = 60
  const chartWidth = data.length * (barWidth * 2 + gap)
  const padding = 40

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth + padding * 2} height={height} className="text-xs">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={height - padding - ratio * (height - padding * 2)}
            x2={chartWidth + padding}
            y2={height - padding - ratio * (height - padding * 2)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="3 3"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const x = padding + index * (barWidth * 2 + gap)
          const allocHeight = (item.المخصصات / maxValue) * (height - padding * 2)
          const orderHeight = (item.الأوامر / maxValue) * (height - padding * 2)

          return (
            <g key={index}>
              {/* Allocation bar */}
              <rect
                x={x}
                y={height - padding - allocHeight}
                width={barWidth}
                height={allocHeight}
                fill="hsl(var(--chart-1))"
                rx="4"
              />
              {/* Order bar */}
              <rect
                x={x + barWidth + 5}
                y={height - padding - orderHeight}
                width={barWidth}
                height={orderHeight}
                fill="hsl(var(--chart-2))"
                rx="4"
              />
              {/* Month label */}
              <text
                x={x + barWidth}
                y={height - padding + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
              >
                {item.month}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${padding}, 20)`}>
          <rect width="12" height="12" fill="hsl(var(--chart-1))" rx="2" />
          <text x="18" y="10" className="fill-foreground text-xs">
            المخصصات
          </text>
          <rect x="100" width="12" height="12" fill="hsl(var(--chart-2))" rx="2" />
          <text x="118" y="10" className="fill-foreground text-xs">
            الأوامر
          </text>
        </g>
      </svg>
    </div>
  )
}

interface LineChartData {
  month: string
  المخصصات: number
  الأوامر: number
  الرصيد: number
}

interface SimpleLineChartProps {
  data: LineChartData[]
  height?: number
}

export function SimpleLineChart({ data, height = 350 }: SimpleLineChartProps) {
  if (!data.length) return null

  const maxValue = Math.max(...data.flatMap((d) => [d.المخصصات, d.الأوامر, Math.abs(d.الرصيد)]))
  const minValue = Math.min(...data.map((d) => d.الرصيد))
  const range = maxValue - Math.min(minValue, 0)

  const chartWidth = 800
  const padding = 50
  const stepX = (chartWidth - padding * 2) / (data.length - 1 || 1)

  const getY = (value: number) => {
    return height - padding - ((value - Math.min(minValue, 0)) / range) * (height - padding * 2)
  }

  const createPath = (key: keyof LineChartData) => {
    return data
      .map((item, index) => {
        const x = padding + index * stepX
        const y = getY(item[key] as number)
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={height} className="text-xs">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (height - padding * 2)}
            x2={chartWidth - padding}
            y2={padding + ratio * (height - padding * 2)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="3 3"
          />
        ))}

        {/* Lines */}
        <path d={createPath("المخصصات")} fill="none" stroke="#10b981" strokeWidth="2" />
        <path d={createPath("الأوامر")} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <path d={createPath("الرصيد")} fill="none" stroke="#f59e0b" strokeWidth="2" />

        {/* X-axis labels */}
        {data.map((item, index) => (
          <text
            key={index}
            x={padding + index * stepX}
            y={height - padding + 20}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {item.month}
          </text>
        ))}

        {/* Legend */}
        <g transform={`translate(${padding}, 20)`}>
          <line x1="0" y1="6" x2="20" y2="6" stroke="#10b981" strokeWidth="2" />
          <text x="25" y="10" className="fill-foreground text-xs">
            المخصصات
          </text>
          <line x1="100" y1="6" x2="120" y2="6" stroke="#3b82f6" strokeWidth="2" />
          <text x="125" y="10" className="fill-foreground text-xs">
            الأوامر
          </text>
          <line x1="200" y1="6" x2="220" y2="6" stroke="#f59e0b" strokeWidth="2" />
          <text x="225" y="10" className="fill-foreground text-xs">
            الرصيد
          </text>
        </g>
      </svg>
    </div>
  )
}

interface PieChartData {
  name: string
  value: number
  color: string
}

interface SimplePieChartProps {
  data: PieChartData[]
  height?: number
}

export function SimplePieChart({ data, height = 300 }: SimplePieChartProps) {
  if (!data.length) return null

  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return null

  const centerX = height / 2
  const centerY = height / 2
  const radius = Math.min(centerX, centerY) - 40

  let currentAngle = -90

  return (
    <svg width={height} height={height} className="text-xs">
      {data.map((item, index) => {
        const percentage = item.value / total
        const angle = percentage * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle

        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        const x1 = centerX + radius * Math.cos(startRad)
        const y1 = centerY + radius * Math.sin(startRad)
        const x2 = centerX + radius * Math.cos(endRad)
        const y2 = centerY + radius * Math.sin(endRad)

        const largeArc = angle > 180 ? 1 : 0

        const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

        // Label position
        const labelAngle = startAngle + angle / 2
        const labelRad = (labelAngle * Math.PI) / 180
        const labelX = centerX + radius * 0.7 * Math.cos(labelRad)
        const labelY = centerY + radius * 0.7 * Math.sin(labelRad)

        currentAngle = endAngle

        return (
          <g key={index}>
            <path d={path} fill={item.color} />
            {percentage > 0.05 && (
              <text x={labelX} y={labelY} textAnchor="middle" className="fill-white text-xs font-medium">
                {`${item.name} ${(percentage * 100).toFixed(0)}%`}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
