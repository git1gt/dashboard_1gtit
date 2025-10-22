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

        if (employeesError && employeesError.code !== 'PGRST116') {
          console.error('Error fetching employees:', employeesError);
        }
        
        if (!employees || employees.length === 0) {
          setError('Ошибка получения данных сотрудников');
          return;
        }

        // For each employee, get their position and team
        const teamWithDetails = await Promise.all(
          employees.map(async (employee) => {
            // Get position
            const { data: positionData, error: positionError } = await supabase
              .from('employee_by_position')
              .select(`
                positions (
                  position
                )
              `)
              .eq('employee_id', employee.employee_id)
              .maybeSingle();

            if (positionError && positionError.code !== 'PGRST116') {
              console.error('Error fetching position:', positionError);
            }

            // Get team
            const { data: teamData, error: teamError } = await supabase
              .from('employee_in_team')
              .select(`
                teams (
                  team
                )
              `)
              .eq('employee_id', employee.employee_id)
              .maybeSingle();

            if (teamError && teamError.code !== 'PGRST116') {
              console.error('Error fetching team:', teamError);
            }

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