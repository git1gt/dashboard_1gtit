import { useState, useEffect } from 'react';
import { supabase, type MetricWithDetails } from '@/lib/supabase';

export interface ChartDataPoint {
  month: string;
  month_name: string;
  [key: string]: string | number;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricWithDetails[]>([]);
  // const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Get current month and year
        const currentMonthId = 10 as number;
        //const currentMonthId = currentDate.getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // First, get the year_id for currentYear
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

        if (!finalMonthData) return; 
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
              metric_id,
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
          setError('Нет данных за этот месяц');
          return;
        }

        // Фильтрация метрик: исключаем те, что использовались в двух предыдущих месяцах
        let filteredMetrics = monthlyMetrics;
        
        try {
          // Получаем ID двух предыдущих месяцев
          const currentMonthIdForFilter = finalMonthData.month_id;
          const prevMonth1Id = currentMonthIdForFilter === 1 ? 12 : currentMonthIdForFilter - 1;
          const prevMonth2Id = prevMonth1Id === 1 ? 12 : prevMonth1Id - 1;
          
          // Получаем monthyear_id для предыдущих месяцев
          const { data: prevMonthsYearData, error: prevMonthsError } = await supabase
            .from('month_in_year')
            .select('monthyear_id')
            .eq('year_id', yearData.year_id)
            .in('month_id', [prevMonth1Id, prevMonth2Id]);

          if (!prevMonthsError && prevMonthsYearData && prevMonthsYearData.length > 0) {
            const prevMonthYearIds = prevMonthsYearData.map(m => m.monthyear_id);
            
            // Получаем metric_id метрик из предыдущих месяцев
            const { data: prevMetrics, error: prevMetricsError } = await supabase
              .from('monthly_metrics')
              .select('metric_id')
              .in('monthyear_id', prevMonthYearIds);

            if (!prevMetricsError && prevMetrics && prevMetrics.length > 0) {
              const usedMetricIds = new Set(prevMetrics.map(m => m.metric_id).filter(Boolean));
              
              // Исключаем метрики, которые использовались в предыдущих месяцах
              filteredMetrics = monthlyMetrics.filter(metric => 
                !usedMetricIds.has(metric.metric_id)
              );
            }
          }
        } catch (filterError) {
          console.warn('Ошибка при фильтрации метрик:', filterError);
          // Продолжаем с исходными метриками при ошибке фильтрации
        }

        // Если после фильтрации метрик не осталось, используем исходные
        if (filteredMetrics.length === 0) {
          filteredMetrics = monthlyMetrics;
        }

        // Получаем информацию о командах для группировки
        let finalMetrics = filteredMetrics;
        
        try {
          const metricIds = filteredMetrics.map(m => m.metric_id).filter(Boolean);
          
          if (metricIds.length > 0) {
            // Получаем связи метрик с командами
            const { data: metricTeams, error: metricTeamsError } = await supabase
              .from('metric_by_team')
              .select('metric_id, team_id')
              .in('metric_id', metricIds);

            if (!metricTeamsError && metricTeams && metricTeams.length > 0) {
              // Группируем метрики по командам
              const metricsByTeam = new Map<number, typeof filteredMetrics>();
              
              filteredMetrics.forEach(metric => {
                const teamRelation = metricTeams.find(mt => mt.metric_id === metric.metric_id);
                if (teamRelation) {
                  const teamId = teamRelation.team_id;
                  if (!metricsByTeam.has(teamId)) {
                    metricsByTeam.set(teamId, []);
                  }
                  metricsByTeam.get(teamId)!.push(metric);
                }
              });

              // Выбираем не более 2 метрик из каждой команды
              const selectedMetrics: typeof filteredMetrics = [];
              metricsByTeam.forEach(teamMetrics => {
                const shuffled = [...teamMetrics].sort(() => Math.random() - 0.5);
                selectedMetrics.push(...shuffled.slice(0, 2));
              });

              // Перемешиваем и выбираем не более 4 метрик
              const shuffledFinal = [...selectedMetrics].sort(() => Math.random() - 0.5); 
              finalMetrics = shuffledFinal.slice(0, 4);
            }
          }
        } catch (groupError) {
          console.warn('Ошибка при группировке метрик:', groupError);
          // Продолжаем с отфильтрованными метриками при ошибке группировки
          finalMetrics = filteredMetrics.slice(0, 4);
        }

        // Если итоговых метрик меньше 4, дополняем из исходных
        if (finalMetrics.length < 4) {
          const usedIds = new Set(finalMetrics.map(m => m.metric_id));
          const additionalMetrics = monthlyMetrics
            .filter(m => !usedIds.has(m.metric_id))
            .slice(0, 4 - finalMetrics.length);
          finalMetrics = [...finalMetrics, ...additionalMetrics];
        }

        // Transform data
        const transformedMetrics: MetricWithDetails[] = finalMetrics.map(metric => {
          const metricsData = Array.isArray(metric.metrics) ? metric.metrics[0] : metric.metrics;
          return {
            monthmetric_id: metric.monthmetric_id,
            metric_id: metric.metric_id,
            value: metric.value,
            metrics: {
              metric_id: metricsData?.metric_id || 0,
              metric: metricsData?.metric || '',
              measurement: metricsData?.measurement || null
            },
            metric_name: metricsData?.metric || 'Неизвестная метрика'
          };
        });

        // Sort by metric_name for consistent order
        const sortedMetrics = [...transformedMetrics].sort((a, b) =>
          (a.metric_name || '').localeCompare(b.metric_name || '')
        );

        console.log('ORDER BEFORE SET:', sortedMetrics.map(m => ({
          id: m.metric_id,
          name: m.metric_name
        })));

        setMetrics(sortedMetrics);

        //await fetchChartData(yearData.year_id, transformedMetrics);
      } catch (err) {
        // Fetch chart data for all months in 2025
        console.error('Unexpected error:', err);
        setError('Произошла неожиданная ошибка');
      } finally {
        setLoading(false);
      }
    }


  {/* Для графика

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
            if (metric.metrics?.measurement) {
              chartDataMap[month.month][metric.metrics.measurement] = 0;
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
              }
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
    

  */}

  fetchMetrics();
    }, []);

  //return { metrics, chartData, loading, error };
  return { metrics, loading, error };
}