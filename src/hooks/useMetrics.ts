import { useState, useEffect } from 'react';
import { supabase, type MetricWithDetails } from '@/lib/supabase';

export interface ChartDataPoint {
  month: string;
  month_name: string;
  [key: string]: string | number;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricWithDetails[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
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

        await fetchChartData(yearData.year_id, transformedMetrics);
      } catch (err) {
        // Fetch chart data for all months in 2025
        console.error('Unexpected error:', err);
        setError('Произошла неожиданная ошибка');
      } finally {
        setLoading(false);
      }
    }

    async function fetchChartData(yearId: number, selectedMetrics: MetricWithDetails[]) {
      try {
        // Get all months
        const { data: allMonths, error: monthsError } = await supabase
          .from('months')
          .select('month_id, month')
          .order('month_id');

        if (monthsError && monthsError.code !== 'PGRST116') {
          console.error('Error fetching all months:', monthsError);
          return;
        }

        if (!allMonths || allMonths.length === 0) {
          return;
        }

        // Get all month_in_year records for 2025
        const { data: monthsInYear, error: monthsInYearError } = await supabase
          .from('month_in_year')
          .select('monthyear_id, month_id')
          .eq('year_id', yearId);

        if (monthsInYearError && monthsInYearError.code !== 'PGRST116') {
          console.error('Error fetching months in year:', monthsInYearError);
          return;
        }

        if (!monthsInYear || monthsInYear.length === 0) {
          return;
        }

        // Get metrics for selected metric IDs across all months
        const metricIds = selectedMetrics.map(m => m.metric_id);
        const monthYearIds = monthsInYear.map(m => m.monthyear_id);

        const { data: allMetricsData, error: allMetricsError } = await supabase
          .from('monthly_metrics')
          .select(`
            monthyear_id,
            metric_id,
            value,
            metrics (
              metric,
              measurement
            )
          `)
          .in('monthyear_id', monthYearIds)
          .in('metric_id', metricIds);

        if (allMetricsError && allMetricsError.code !== 'PGRST116') {
          console.error('Error fetching all metrics data:', allMetricsError);
          return;
        }


        // Transform data for chart
        const chartDataMap: { [key: string]: ChartDataPoint } = {};

        // Initialize all months with 0 values for all selected metrics
        allMonths.forEach(month => {
          chartDataMap[month.month] = {
            month: month.month,
            month_name: month.month
          };
          
          // Initialize all selected metrics with 0 for this month
          selectedMetrics.forEach(metric => {
            if (metric.metrics[0]?.measurement) {
              chartDataMap[month.month][metric.metrics[0]?.measurement] = 0;
            }
          });
        });

        // Fill in metric values
        if (allMetricsData && allMetricsData.length > 0) {
            allMetricsData.forEach(metric => {
          const monthInYear = monthsInYear.find(m => m.monthyear_id === metric.monthyear_id);
          if (monthInYear) {
            const month = allMonths.find(m => m.month_id === monthInYear.month_id);
            if (month && metric.metrics?.measurement) {
              chartDataMap[month.month][metric.metrics.measurement] = metric.value || 0;
            if (month && metric.metrics[0]?.measurement) {
              chartDataMap[month.month][metric.metrics[0]?.measurement] = metric.value || 0;
            }
          });
        }

        // Convert to array and sort by month order
        const chartDataArray = allMonths.map(month => chartDataMap[month.month]);

        setChartData(chartDataArray);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    }
    fetchMetrics();
  }, []);

  return { metrics, chartData, loading, error };
}