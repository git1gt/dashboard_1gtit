import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TeamByMetric {
  metric_name: string;
  team_name: string;
  employees: Array<{
    employee_id: number;
    full_name: string;
  }>;
}

export function useTeam() {
  const [teamsByMetrics, setTeamsByMetrics] = useState<TeamByMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamsByMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Get teams that participated in metrics through metric_by_team
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
          setError('Нет команд, участвующих в метриках');
          return;
        }

        // Group by metric and get team info
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

        // For each metric, get team details and employees
        const teamsByMetricsData: TeamByMetric[] = [];

        for (const [metricName, teamIds] of metricsMap.entries()) {
          const teamIdsArray = Array.from(teamIds);

          // Get team names
          const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('team_id, team')
            .in('team_id', teamIdsArray);

          if (teamsError && teamsError.code !== 'PGRST116') {
            console.error('Error fetching teams:', teamsError);
            continue;
          }

          if (!teams || teams.length === 0) {
            continue;
          }

          // For each team, get employees
          for (const team of teams) {
            const { data: employeesInTeam, error: employeesError } = await supabase
              .from('employee_in_team')
              .select(`
                employees (
                  employee_id,
                  full_name
                )
              `)
              .eq('team_id', team.team_id);

            if (employeesError && employeesError.code !== 'PGRST116') {
              console.error('Error fetching employees:', employeesError);
              continue;
            }

            const employees = employeesInTeam?.map(item => item.employees).filter(Boolean) || [];

            if (employees.length > 0) {
              teamsByMetricsData.push({
                metric_name: metricName,
                team_name: team.team,
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