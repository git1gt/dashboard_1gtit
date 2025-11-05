import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useMetrics } from '@/hooks/useMetrics';
import { useTeam } from '@/hooks/useTeam';

export function TeamSection() {
  const { metrics, loading: metricsLoading } = useMetrics();
  const { employeesByMetrics, loading, error } = useTeam(metrics);

  if (loading || metricsLoading) {
    return <p className="text-gray-500 text-center mb-10">Загрузка...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!employeesByMetrics.length) {
    return <p>Нет данных по командам за выбранный месяц</p>;
  }

  return (
    <div className="w-full mb-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Кто участвовал в метриках
      </h3>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employeesByMetrics.map(metric => (
          <Card key={metric.metric_id} className="bg-white/90 border-0 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Сотрудники, которые {metric.metric_name}
                </h4>
              </div>
            </CardHeader>
            <CardContent>
              {metric.employees.length ? (
                metric.employees.map(emp => (
                  <div
                    key={emp.employee_id}
                    className="text-sm text-gray-700 py-1 px-2 bg-gray-50 mb-2 rounded-md"
                  >
                    {emp.full_name}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Нет сотрудников</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}