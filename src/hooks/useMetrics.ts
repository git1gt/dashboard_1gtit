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
        const currentMonth = currentDate.toLocaleString('ru-RU', { month: 'long' });
        const currentYear = 2025;

        // First, get the year_id for 2025
        const { data: yearData, error: yearError } = await supabase
          .from('years')
          .select('year_id')
          .eq('year', currentYear)
          .single();

        if (yearError) {
          console.error('Error fetching year:', yearError);
          setError('Ошибка получения данных года');
          return;
        }

        // Get current month_id
        const { data: monthData, error: monthError } = await supabase
          .from('months')
          .select('month_id')
          .eq('month', currentMonth)
          .single();

        if (monthError) {
          console.error('Error fetching month:', monthError);
          // Try previous month if current month not found
          const prevDate = new Date();
          prevDate.setMonth(prevDate.getMonth() - 1);
          const prevMonth = prevDate.toLocaleString('ru-RU', { month: 'long' });
          
          const { data: prevMonthData, error: prevMonthError } = await supabase
            .from('months')
            .select('month_id')
            .eq('month', prevMonth)
            .single();

          if (prevMonthError) {
            console.error('Error fetching previous month:', prevMonthError);
            setError('Ошибка получения данных месяца');
            return;
          }
          
          monthData = prevMonthData;
        }

        // Get monthyear_id
        const { data: monthYearData, error: monthYearError } = await supabase
          .from('month_in_year')
          .select('monthyear_id')
          .eq('year_id', yearData.year_id)
          .eq('month_id', monthData.month_id)
          .single();

        if (monthYearError) {
          console.error('Error fetching month_in_year:', monthYearError);
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

        if (metricsError) {
          console.error('Error fetching metrics:', metricsError);
          setError('Ошибка получения метрик');
          return;
        }

        if (!monthlyMetrics || monthlyMetrics.length === 0) {
          setError('Нет данных за этот месяц');
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