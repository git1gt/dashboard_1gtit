import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Metric {
  metric_id: number;
  metric: string;
  measurement: string | null;
  created_at: string | null;
}

export interface MonthlyMetric {
  monthmetric_id: number;
  metric_id: number | null;
  monthyear_id: number | null;
  value: number | null;
  created_at: string | null;
  metrics?: Metric;
}

export interface Employee {
  employee_id: number;
  full_name: string;
}

export interface Position {
  position_id: number;
  position: string;
}

export interface Team {
  team_id: number;
  team: string;
}

export interface Year {
  year_id: number;
  year: number;
}

export interface Month {
  month_id: number;
  month: string;
  quarter: number | null;
}

export interface MonthInYear {
  monthyear_id: number;
  year_id: number | null;
  month_id: number | null;
}

export interface EmployeeWithDetails extends Employee {
  position?: string;
  team?: string;
}

export interface MetricWithDetails extends MonthlyMetric {
  metric_name?: string;
}