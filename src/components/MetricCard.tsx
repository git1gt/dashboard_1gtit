import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  delay?: number;
}

export function MetricCard({ title, value, subtitle, delay = 0 }: MetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(counter);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(counter);
    }, delay);
    
    return () => clearTimeout(timer);я
  }, [value, delay]);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-100/50 hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      <CardHeader className="pb-3">
        <p className="text-sm font-medium text-[#081C2C]">{title}</p>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-2">
          <div className="text-5xl font-bold tabular-nums text-[#46C9F3]">
            {animatedValue.toLocaleString()}
          </div>
          <p className="text-sm text-[#081C2C]">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}