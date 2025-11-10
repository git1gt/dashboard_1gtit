import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Building2 } from 'lucide-react';
import { MetricsGrid } from '@/components/MetricsGrid';
import { TeamSection } from '@/components/TeamSection';
import { useMetrics } from '@/hooks/useMetrics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function App() {
  const { metrics, chartData, loading: chartLoading } = useMetrics();
  const currentYear = new Date().getFullYear();

  // Get unique measurements for chart lines
  const measurements = chartData.length > 0 
    ? Array.from(new Set(
        chartData.flatMap(item => 
          Object.keys(item).filter(key => key !== 'month' && key !== 'month_name')
        )
      ))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/10 backdrop-blur-sm sticky top-0 z-10 w-full">
        <div className="w-full px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.reload()} 
                variant="ghost"
                className=" 
                focus:outline-none 
                active:outline-none 
                hover:outline-none
                focus-visible:ring-0
                transition-transform duration-200 hover:scale-105
                cursor-pointer bg-transparent"
                >
                <img 
                  src="/Лого 1GT IT.png" 
                  alt="1GT Logo" 
                  className="h-12 w-auto"
                />
              </button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                {currentYear} Отчет 
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8">
        {/* Title Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
             Что мы сделали за {currentYear} год
          </h2>
        </div>

        {/* Metrics Grid */}
        <MetricsGrid />

        {/* Chart Section 
        <div className="mb-12">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Динамика показателей
                  </h3>
                  <p className="text-sm text-gray-600">
                    Помесячная статистика за 2025 год
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-500">Загрузка данных графика...</div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-500">Нет данных для отображения</div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#374151' }}
                        formatter={(value: any, name: string) => [
                          typeof value === 'number' ? value.toLocaleString() : value,
                          name
                        ]}
                      />
                      {measurements.map((measurement, index) => (
                        <Line 
                          key={measurement}
                          type="monotone" 
                          dataKey={measurement}
                          stroke={colors[index % colors.length]}
                          strokeWidth={3}
                          dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        */}

        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Кто участвовал в метриках
        </h3>

        {/* Team Section */}
        <TeamSection selectedMetrics={metrics}/>

        {/* Footer Section */}
        <div className="pt-8 border-t border-gray-200/50 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-transparent"
                >
                <img 
                  src="/Лого 1GT IT.png" 
                  alt="1GT Logo" 
                  className="h-8 w-auto opacity-80"
                />
              </button>
              <div>
                <p className="font-semibold text-sm text-gray-500">© 1GT.IT {currentYear}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Отчет обновлен: {new Date().toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;