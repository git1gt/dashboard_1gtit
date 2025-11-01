import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTeam } from '@/hooks/useTeam';
import { Users } from 'lucide-react';

export function TeamSection() {
  const { employeesByMetrics, loading, error } = useTeam();

  if (loading) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Сотрудники по метрикам
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse bg-white/90 backdrop-blur-sm border-0">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Сотрудники по метрикам
        </h3>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employeesByMetrics || employeesByMetrics.length === 0) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Сотрудники по метрикам
        </h3>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Нет данных о сотрудниках</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Сотрудники по метрикам
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employeesByMetrics.map((metric, index) => (
          <Card
            key={metric.metric_name || index}
            className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Сотрудники, которые {metric.metric_name}
                </h4>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metric.employees?.length ? (
                  metric.employees.map(employee => (
                    <div
                      key={employee.employee_id}
                      className="text-sm text-gray-700 py-1 px-2 bg-gray-50 rounded-md"
                    >
                      {employee.full_name}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Нет сотрудников</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}