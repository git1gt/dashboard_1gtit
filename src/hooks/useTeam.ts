import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TeamMetricData {
  metric_name: string;
  team_name: string;
  employees: Array<{
    employee_id: number;
    full_name: string;
  }>;
}

export function useTeam() {
  const [teamsByMetrics, setTeamsByMetrics] = useState<TeamMetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamsByMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Получаем команды, участвовавшие в метриках
        const { data: metricTeams, error: metricTeamsError } = await supabase
          .from('metric_by_team')
          .select(`
            team_id,
            teams!inner (
              team
            ),
            metrics!inner (
              metric
            )
          `);

        if (metricTeamsError && metricTeamsError.code !== 'PGRST116') {
          console.error('Error fetching metric teams:', metricTeamsError);
        }

        if (!metricTeams || metricTeams.length === 0) {
          setError('Нет команд, участвующих в метриках');
          return;
        }

        const teamsByMetricsData: TeamMetricData[] = [];

        for (const item of metricTeams) {
          const metricName = item.metrics?.metric;
          const teamName = item.teams?.team;
          
          if (metricName && teamName && item.team_id) {
            // Получаем всех сотрудников этой команды
            const { data: employeesData, error: employeesError } = await supabase
              .from('employee_in_team')
              .select(`
                employees (
                  employee_id,
                  full_name
                )
              `)
              .eq('team_id', item.team_id);

            if (employeesError && employeesError.code !== 'PGRST116') {
              console.error('Error fetching employees:', employeesError);
              continue;
            }

            // Извлекаем сотрудников в один список
            const employees = employeesData?.map(emp => emp.employees).filter(Boolean) || [];

            if (employees.length > 0) {
              teamsByMetricsData.push({
                metric_name: metricName,
                team_name: teamName,
                employees: employees
              });
            }
          }
        }

        setTeamsByMetrics(teamsByMetricsData);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Произошла неожиданная ошибка');
      } finally {
        setLoading(false);
      }
    }

    fetchTeamsByMetrics();
  }, []);

  return { teamsByMetrics, loading, error };
}