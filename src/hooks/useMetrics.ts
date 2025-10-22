import { useState, useEffect } from 'react';
import { supabase, type MetricWithDetails } from '@/lib/supabase';

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Get current month and year
        const currentDate = new Date();
        const currentMonthId = currentDate.getMonth() + 1;
        const currentYear = 2025;

        // First, get the year_id for 2025
        const { data: yearData, error: yearError } = await supabase
          .from('years')
          .select('year_id')
          .eq('year', currentYear)
          .maybeSingle();

        if (yearError && yearError.code !== 'PGRST116') {
          console.error('Error fetching year:', yearError);
        }
        
        if (!yearData) {
          setError('Ошибка получения данных года');
          return;
        }

       // Получаем текущий месяц из БД
        const { data: monthData, error: monthError } = await supabase
          .from('months')
          .select('month_id')
          .eq('month_id', currentMonthId)
          .maybeSingle();
        
        if (monthError && monthError.code !== 'PGRST116') {
          console.error('Error fetching month:', monthError);
        }
        
        let finalMonthData = monthData;
        
        // Если данных нет — пробуем предыдущий месяц
        if (!monthData) {
          const prevMonthId = currentMonthId === 1 ? 12 : currentMonthId - 1;
        
          const { data: prevMonthData, error: prevMonthError } = await supabase
            .from('months')
            .select('month_id')
            .eq('month_id', prevMonthId)
            .maybeSingle();
        
          if (prevMonthError && prevMonthError.code !== 'PGRST116') {
            console.error('Error fetching previous month:', prevMonthError);
          }
        
          if (!prevMonthData) {
            setError('Ошибка получения данных месяца');
            return;
          }
        
          finalMonthData = prevMonthData;
        }

        // Get monthyear_id
        const { data: monthYearData, error: monthYearError } = await supabase
          .from('month_in_year')
          .select('monthyear_id')
          .eq('year_id', yearData.year_id)
          .eq('month_id', finalMonthData.month_id)
          .maybeSingle();

        if (monthYearError && monthYearError.code !== 'PGRST116') {
          console.error('Error fetching month_in_year:', monthYearError);
        }
        
        if (!monthYearData) {
          setError('Нет данных за этот месяц');
          return;
        }

        // Get 4 random metrics for this month/year
        const { data: monthlyMetrics, error: metricsError } = await supabase
          .from('monthly_metrics')
          .select(`
            monthmetric_id,
            metric_id,
            value,
            metrics (
              metric,
              measurement
            )
          `)
          .eq('monthyear_id', monthYearData.monthyear_id)
          .limit(4);

        if (metricsError && metricsError.code !== 'PGRST116') {
          console.error('Error fetching metrics:', metricsError);
        }
        
        if (!monthlyMetrics || monthlyMetrics.length === 0) {
          setError('Ошибка получения метрик');
          return;
        }

        // Transform data
        const transformedMetrics: MetricWithDetails[] = monthlyMetrics.map(metric => ({
          ...metric,
          metric_name: metric.metrics?.metric || 'Неизвестная метрика'
        }));

        setMetrics(transformedMetrics);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Произошла неожиданная ошибка');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}