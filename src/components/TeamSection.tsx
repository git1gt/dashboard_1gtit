import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeam } from '@/hooks/useTeam';

// Generate placeholder avatar URLs
const generateAvatarUrl = (index: number) => {
  const seed = `employee-${index}`;
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

const badgeColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-orange-500'
];

function TeamMemberCard({ member, index }: { member: any; index: number }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={generateAvatarUrl(index)}
              alt={member.full_name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg transition-transform group-hover:scale-105"
            />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{member.full_name}</h3>
          <p className="text-sm text-gray-600 mb-3">{member.position}</p>
          <Badge className={`${badgeColors[index % badgeColors.length]} text-white border-0 text-xs px-3 py-1`}>
            {member.team}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamSection() {
  const { team, loading, error } = useTeam();

  if (loading) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Наша команда
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse bg-white/90 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Наша команда
        </h3>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Наша команда
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {team.map((member, index) => (
          <TeamMemberCard key={member.employee_id} member={member} index={index} />
        ))}
      </div>
    </div>
  );
}