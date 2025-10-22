import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileCheck, FolderCheck, Clock, Users, TrendingUp, BarChart3, Phone, Ticket } from 'lucide-react';
import { useMetrics } from '@/hooks/useMetrics';
import { MetricCard } from './MetricCard';

const measurementIconMap: Record<string, { icon: JSX.Element; color: string }> = {
  'часов': { icon: <Clock className="w-6 h-6" />, color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
  'мероприятиях': { icon: <Users className="w-6 h-6" />, color: 'bg-gradient-to-br from-green-400 to-green-500' },
  'участникам мероприятий': { icon: <Users className="w-6 h-6" />, color: 'bg-gradient-to-br from-green-400 to-green-500' },
  'заявок': { icon: <FileCheck className="w-6 h-6" />, color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  'заявкам': { icon: <FileCheck className="w-6 h-6" />, color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  'задачам': { icon: <FolderCheck className="w-6 h-6" />, color: 'bg-gradient-to-br from-cyan-400 to-cyan-500' },
  'звонков': { icon: <Phone className="w-6 h-6" />, color: 'bg-gradient-to-br from-orange-400 to-orange-500' },
  'обращений': { icon: <Ticket className="w-6 h-6" />, color: 'bg-gradient-to-br from-pink-400 to-pink-500' },
  'по умолчанию': { icon: <BarChart3 className="w-6 h-6" />, color: 'bg-gray-400' },
};

export function MetricsGrid() {
  const { metrics, loading, error } = useMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse bg-white/90 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 rounded-xl bg-gray-200 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="col-span-full bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {metrics.map((metric, index) => {
        const measurement = metric.metrics?.measurement || 'по умолчанию';
        const iconConfig = measurementIconMap[measurement] || measurementIconMap['по умолчанию'];
        return (
          <MetricCard
            key={metric.monthmetric_id}
            icon={iconConfig.icon}
            title={metric.metric_name || 'Неизвестная метрика'}
            value={metric.value || 0}
            subtitle={measurement}
            delay={index * 200}
            color={iconConfig.color}
          />
        );
      })}
    </div>
  );
}