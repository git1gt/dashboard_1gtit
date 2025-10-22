import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  FolderCheck, 
  Clock, 
  Users,
  TrendingUp,
  Building2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  delay?: number;
  color: string;
}

interface TeamMember {
  name: string;
  role: string;
  department: string;
  image: string;
  badgeColor: string;
}

const chartData = [
  { month: 'Янв', value: 5234 },
  { month: 'Фев', value: 5789 },
  { month: 'Мар', value: 6234 },
  { month: 'Апр', value: 6543 },
  { month: 'Май', value: 6789 },
  { month: 'Июн', value: 6934 },
  { month: 'Июл', value: 7012 },
  { month: 'Авг', value: 8234 },
  { month: 'Сен', value: 8567 },
  { month: 'Окт', value: 8934 },
  { month: 'Ноя', value: 9123 },
  { month: 'Дек', value: 9456 }
];

const teamMembers: TeamMember[] = [
  {
    name: 'Александр Иванов',
    role: 'Tech Lead',
    department: 'Backend',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badgeColor: 'bg-blue-500'
  },
  {
    name: 'Мария Петрова',
    role: 'UI/UX Designer',
    department: 'Design',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badgeColor: 'bg-purple-500'
  },
  {
    name: 'Дмитрий Смирнов',
    role: 'Senior Developer',
    department: 'Frontend',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badgeColor: 'bg-cyan-500'
  },
  {
    name: 'Елена Волкова',
    role: 'Product Manager',
    department: 'Management',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badgeColor: 'bg-teal-500'
  },
  {
    name: 'Андрей Козлов',
    role: 'DevOps Engineer',
    department: 'Infrastructure',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badgeColor: 'bg-green-500'
  },
  {
    name: 'Ольга Новикова',
    role: 'Support Specialist',
    department: 'Support',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badgeColor: 'bg-orange-500'
  }
];

function MetricCard({ icon, title, value, subtitle, delay = 0, color }: MetricCardProps) {
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
    
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-100/50 hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      <CardHeader className="pb-3">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white mb-3 transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900 tabular-nums">
            {animatedValue.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={member.image}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg transition-transform group-hover:scale-105"
            />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{member.role}</p>
          <Badge className={`${member.badgeColor} text-white border-0 text-xs px-3 py-1`}>
            {member.department}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/Лого 1GT IT.png" 
                alt="1GT Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Автоматизация</h1>
                <p className="text-sm text-gray-600">и ИТ</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                2025 Отчет
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Показатели 1GT.IT
          </h2>
          <p className="text-lg text-gray-600">
            Что мы сделали за 2025 год
          </p>
        </div>

        {/* Key Metrics Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Ключевые показатели
          </h3>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard
            icon={<FileCheck className="w-6 h-6" />}
            title="Обработанных заявок"
            value={7145}
            subtitle="В августе 2025"
            delay={0}
            color="bg-gradient-to-br from-cyan-400 to-cyan-500"
          />
          
          <MetricCard
            icon={<FolderCheck className="w-6 h-6" />}
            title="Завершенных проектов"
            value={127}
            subtitle="За весь 2025 год"
            delay={200}
            color="bg-gradient-to-br from-cyan-400 to-cyan-500"
          />
          
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            title="Часов работы"
            value={18543}
            subtitle="Работы в проектах"
            delay={400}
            color="bg-gradient-to-br from-cyan-400 to-cyan-500"
          />
          
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            title="Активных участников"
            value={42}
            subtitle="Члены команды"
            delay={600}
            color="bg-gradient-to-br from-cyan-400 to-cyan-500"
          />
        </div>

        {/* Chart Section */}
        <div className="mb-12">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Динамика обработанных заявок
                  </h3>
                  <p className="text-sm text-gray-600">
                    Помесячная статистика за 2025 год
                  </p>
                </div>
                <Tabs defaultValue="requests" className="w-auto">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                    <TabsTrigger value="requests" className="text-xs">Заявки</TabsTrigger>
                    <TabsTrigger value="projects" className="text-xs">Проекты</TabsTrigger>
                    <TabsTrigger value="hours" className="text-xs">Часы</TabsTrigger>
                    <TabsTrigger value="team" className="text-xs">Команда</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                      domain={[0, 10000]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Наша команда
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-8 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <img 
                src="/Лого 1GT IT.png" 
                alt="1GT Logo" 
                className="h-8 w-auto opacity-80"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900">© 1GT.IT 2025</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Отчет обновлен: {new Date().toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;