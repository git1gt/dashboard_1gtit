import { useState, useEffect } from 'react';
import { supabase, type EmployeeWithDetails } from '@/lib/supabase';

export function useTeam() {
  const [team, setTeam] = useState<EmployeeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true);
        setError(null);

        // Get 6 random employees
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, full_name')
          .limit(6);

        if (employeesError) {
          console.error('Error fetching employees:', employeesError);
          setError('Ошибка получения данных сотрудников');
          return;
        }

        if (!employees || employees.length === 0) {
          setError('Нет данных о сотрудниках');
          return;
        }

        // For each employee, get their position and team
        const teamWithDetails = await Promise.all(
          employees.map(async (employee) => {
            // Get position
            const { data: positionData } = await supabase
              .from('employee_by_position')
              .select(`
                positions (
                  position
                )
              `)
              .eq('employee_id', employee.employee_id)
              .single();

            // Get team
            const { data: teamData } = await supabase
              .from('employee_in_team')
              .select(`
                teams (
                  team
                )
              `)
              .eq('employee_id', employee.employee_id)
              .single();

            return {
              ...employee,
              position: positionData?.positions?.position || 'Не указано',
              team: teamData?.teams?.team || 'Не указано'
            };
          })
        );

        setTeam(teamWithDetails);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Произошла неожиданная ошибка');
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  return { team, loading, error };
}