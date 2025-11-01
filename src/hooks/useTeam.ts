import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EmployeeByMetric {
  metric_name: string;
  employees: Array<{
    employee_id: number;
    full_name: string;
  }>;
}

export function useTeam() {
  const [employeesByMetrics, setEmployeesByMetrics] = useState<EmployeeByMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeesByMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Получаем команды, участвовавшие в метриках
        const { data: metricTeams, error: metricTeamsError } = await supabase
          .from('metric_by_team')
          .select(`
            team_id,
            metrics!inner (
              metric
            )
          `);

        if (metricTeamsError && metricTeamsError.code !== 'PGRST116') {
          console.error('Error fetching metric teams:', metricTeamsError);
        }

       if (!metricTeams || metricTeams.length === 0) {
  // ВРЕМЕННО: показываем всех сотрудников, чтобы проверить интерфейс
  const { data: allEmployees } = await supabase
    .from('employees')
    .select('employee_id, full_name');

  if (allEmployees) {
    setTeamsByMetrics([
      {
        metric_name: 'тестовая метрика',
        team_name: 'тестовая команда',
        employees: allEmployees
      }
    ]);
  }

  return;
}

        // Группируем по метрикам
        const metricsMap = new Map<string, Set<number>>();

        metricTeams.forEach(item => {
          const metricName = item.metrics?.metric;
          if (metricName && item.team_id) {
            if (!metricsMap.has(metricName)) {
              metricsMap.set(metricName, new Set());
            }
            metricsMap.get(metricName)!.add(item.team_id);
          }
        });

        const employeesByMetricsData: EmployeeByMetric[] = [];

        for (const [metricName, teamIds] of metricsMap.entries()) {
          const teamIdsArray = Array.from(teamIds);

          // Получаем всех сотрудников, связанных с этими командами
          const { data: employeesData, error: employeesError } = await supabase
            .from('employee_in_team')
            .select(`
              employees (
                employee_id,
                full_name
              )
            `)
            .in('team_id', teamIdsArray);

          if (employeesError && employeesError.code !== 'PGRST116') {
            console.error('Error fetching employees:', employeesError);
            continue;
          }

          // Извлекаем сотрудников в один список
          const allEmployees =
            employeesData?.map(item => item.employees).filter(Boolean) || [];

          // Удаляем дубликаты по employee_id
          const uniqueEmployees = Array.from(
            new Map(allEmployees.map(emp => [emp.employee_id, emp])).values()
          );

          if (uniqueEmployees.length > 0) {
            employeesByMetricsData.push({
              metric_name: metricName,
              employees: uniqueEmployees
            });
          }
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
  }, []);

  return { employeesByMetrics, loading, error };
}