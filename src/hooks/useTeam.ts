import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { MetricWithDetails } from '@/lib/supabase';

interface EmployeeByMetric {
  metric_id: number;
  metric_name: string;
  employees: Array<{
    employee_id: number;
    full_name: string;
  }>;
}

export function useTeam(selectedMetrics: MetricWithDetails[]) {
  const [employeesByMetrics, setEmployeesByMetrics] = useState<EmployeeByMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeesByMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Если метрик нет — сразу выход
        if (!selectedMetrics || selectedMetrics.length === 0) {
          setEmployeesByMetrics([]);
          setLoading(false);
          return;
        }

        const metricIds = selectedMetrics.map(m => m.metric_id);

        // Получаем команды, участвовавшие в выбранных метриках
        const { data: metricTeams, error: metricTeamsError } = await supabase
          .from('metric_by_team')
          .select(`
            team_id,
            metric_id,
            metrics!inner (
              metric
            )
          `)
          .in('metric_id', metricIds);

        if (metricTeamsError && metricTeamsError.code !== 'PGRST116') {
          console.error('Error fetching metric teams:', metricTeamsError);
          setError('Ошибка загрузки данных команд');
          return;
        }

        if (!metricTeams || metricTeams.length === 0) {
          setError('Нет команд по выбранным метрикам');
          setEmployeesByMetrics([]);
          return;
        }

        // Группируем по метрикам
        const metricsMap = new Map<number, { metric_name: string; teamIds: number[] }>();

        metricTeams.forEach(item => {
          const metricId = item.metric_id;
          const metricName = item.metrics?.metric;
          if (metricId && metricName) {
            if (!metricsMap.has(metricId)) {
              metricsMap.set(metricId, { metric_name: metricName, teamIds: [] });
            }
            metricsMap.get(metricId)!.teamIds.push(item.team_id);
          }
        });

        const employeesByMetricsData: EmployeeByMetric[] = [];

        for (const [metricId, { metric_name, teamIds }] of metricsMap.entries()) {
          const { data: employeesData, error: employeesError } = await supabase
            .from('employee_in_team')
            .select(`
              employees (
                employee_id,
                full_name
              )
            `)
            .in('team_id', teamIds);

          if (employeesError && employeesError.code !== 'PGRST116') {
            console.error('Error fetching employees:', employeesError);
            continue;
          }

          const allEmployees = employeesData?.map(item => item.employees).filter(Boolean) || [];

          const uniqueEmployees = Array.from(
            new Map(allEmployees.map(emp => [emp.employee_id, emp])).values()
          );

          employeesByMetricsData.push({
            metric_id: metricId,
            metric_name,
            employees: uniqueEmployees
          });
        }

        setEmployeesByMetrics(employeesByMetricsData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Произошла неожиданная ошибка');
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeesByMetrics();
  }, [selectedMetrics]);

  return { employeesByMetrics, loading, error };
}