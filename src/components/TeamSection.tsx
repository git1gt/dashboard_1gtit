import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useTeam } from '@/hooks/useTeam';
import type { MetricWithDetails } from '@/lib/supabase';

interface TeamSectionProps {
  selectedMetrics: MetricWithDetails[];
}

export function TeamSection({ selectedMetrics }: TeamSectionProps) {
  const { employeesByMetrics, loading, error } = useTeam(selectedMetrics);

  if (loading) {
    return <p className="text-gray-500 text-center mb-10">Загрузка...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!employeesByMetrics || employeesByMetrics.length === 0) {
    return <p className="text-gray-500 text-center mb-10"> Нет данных </p>;
  }


  // Создаём Map для быстрого поиска по metric_id
  const employeesMap = new Map(
    employeesByMetrics.map(item => [item.metric_id, item])
  );

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {selectedMetrics.map((metric) => {
        const metricId = metric.metric_id ?? 0;
        const teamData = employeesMap.get(metricId) || {
          metric_id: metricId,
          metric_name: metric.metric_name || 'Неизвестная метрика',
          employees: []
        };

        return (
          <Card key={metric.monthmetric_id} className="bg-white/90 border-0 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-[#081C2C]">
                  {teamData.metric_name}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {teamData.employees.length ? (
                teamData.employees.map((emp: { employee_id: number; full_name: string }) => (
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
        );
      })}
    </div>
  );
}