import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  Building2
} from 'lucide-react';
import { MetricsGrid } from '@/components/MetricsGrid';
import { TeamSection } from '@/components/TeamSection';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const chartData = [
  { month: 'Янв', value: 5234 },
  { month: 'Фев', value: 5789 },
  { month: 'Мар', value: 6234 },
  { month: 'Апр', value: 6543 },
  { month: 'Май', value: 6789 },
  { month: 'Июн', value: 6934 },
  { month: 'Июл', value: 7012 },
  { month: 'Авг', value: 8234 },
  { month: 'Сен', value: 8567 },
  { month: 'Окт', value: 8934 },
  { month: 'Ноя', value: 9123 },
  { month: 'Дек', value: 9456 }
];

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/Лого 1GT IT.png" 
                alt="1GT Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                2025 Отчет
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Показатели 1GT.IT
          </h2>
          <p className="text-lg text-gray-600">
            Что мы сделали за 2025 год
          </p>
        </div>

        {/* Key Metrics Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Ключевые показатели
          </h3>
        </div>

        {/* Metrics Grid */}
        <MetricsGrid />

        {/* Chart Section */}
        <div className="mb-12">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Динамика обработанных заявок
                  </h3>
                  <p className="text-sm text-gray-600">
                    Помесячная статистика за 2025 год
                  </p>
                </div>
                <Tabs defaultValue="requests" className="w-auto">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                    <TabsTrigger value="requests" className="text-xs">Заявки</TabsTrigger>
                    <TabsTrigger value="projects" className="text-xs">Проекты</TabsTrigger>
                    <TabsTrigger value="hours" className="text-xs">Часы</TabsTrigger>
                    <TabsTrigger value="team" className="text-xs">Команда</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
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
                      domain={[0, 10000]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <TeamSection />

        {/* Footer Section */}
        <div className="pt-8 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <img 
                src="/Лого 1GT IT.png" 
                alt="1GT Logo" 
                className="h-8 w-auto opacity-80"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900">© 1GT.IT 2025</p>
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