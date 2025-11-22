'use client';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ViewChartProps {
  data: ChartDataPoint[];
  mode: '24h' | '7d' | '30d';
}

export default function ViewChart({ data, mode }: ViewChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 font-pixel bg-gray-800 rounded-lg">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 200;
  // Increase width for better spacing, especially for 30 days
  const minBarWidth = mode === '30d' ? 30 : mode === '7d' ? 50 : 40;
  const chartWidth = data.length > 0 ? Math.max(600, data.length * minBarWidth) : 600;
  const barWidth = chartWidth / data.length;
  const padding = 50;
  const labelPadding = 50;

  // Generate points for the line/area
  const points = data.map((point, index) => {
    const x = padding + (index * barWidth) + (barWidth / 2);
    const y = padding + chartHeight - (point.value / maxValue) * chartHeight;
    return { x, y, value: point.value, label: point.label };
  });

  // Create path for area fill
  const areaPath = [
    `M ${padding} ${padding + chartHeight}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${padding + chartWidth} ${padding + chartHeight}`,
    'Z'
  ].join(' ');

  // Create path for line
  const linePath = [
    `M ${points[0].x} ${points[0].y}`,
    ...points.slice(1).map(p => `L ${p.x} ${p.y}`)
  ].join(' ');

  // Calculate unique Y-axis values to avoid duplicates
  const uniqueYValues = Array.from(new Set(
    [0, 0.25, 0.5, 0.75, 1].map(ratio => Math.round(ratio * maxValue))
  )).sort((a, b) => a - b);

  return (
    <div className="w-full overflow-x-auto bg-gray-800 rounded-lg p-4">
      <svg
        width={chartWidth + padding * 2}
        height={chartHeight + padding * 2 + labelPadding}
        className="w-full"
        viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2 + labelPadding}`}
      >
        {/* Background rectangle */}
        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill="#1f2937"
          rx="4"
        />

        {/* Grid lines */}
        {uniqueYValues.map((value) => {
          const ratio = maxValue > 0 ? value / maxValue : 0;
          const y = padding + chartHeight - (ratio * chartHeight);
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="11"
                textAnchor="end"
                className="font-pixel"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points with value labels */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#f97316"
              stroke="#fff"
              strokeWidth="2"
              className="hover:r-7 transition-all"
            />
            {/* Value label above point */}
            {point.value > 0 && (
              <text
                x={point.x}
                y={point.y - 12}
                fill="#f97316"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                className="font-pixel"
              >
                {point.value}
              </text>
            )}
            {/* Tooltip on hover */}
            <title>{`${point.label}: ${point.value} views`}</title>
          </g>
        ))}

        {/* X-axis labels - show all labels */}
        {data.map((point, index) => {
          const x = padding + (index * barWidth) + (barWidth / 2);
          
          return (
            <text
              key={index}
              x={x}
              y={padding + chartHeight + 18}
              fill="rgba(255, 255, 255, 0.7)"
              fontSize="10"
              textAnchor="middle"
              className="font-pixel"
            >
              {point.label}
            </text>
          );
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

