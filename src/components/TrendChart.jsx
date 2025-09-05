import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format } from 'date-fns'

const TrendChart = ({ data, variant = 'line', title, dataKey = 'value', color = '#3B82F6' }) => {
  const formatTooltip = (value, name, props) => {
    if (props.payload?.date) {
      return [value, `${name} on ${format(new Date(props.payload.date), 'MMM d')}`]
    }
    return [value, name]
  }

  const ChartComponent = variant === 'bar' ? BarChart : LineChart

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'hsl(235 10% 100%)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          />
          {variant === 'bar' ? (
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          ) : (
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendChart