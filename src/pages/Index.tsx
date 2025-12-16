import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, GraduationCap, BookOpen, School } from "lucide-react";

const stats = [
  {
    title: "Total de Alunos",
    value: "1.247",
    change: "+12% este mês",
    changeType: "positive" as const,
    icon: Users,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Professores Ativos",
    value: "48",
    change: "2 novos este semestre",
    changeType: "neutral" as const,
    icon: GraduationCap,
    iconColor: "bg-info/10 text-info",
  },
  {
    title: "Disciplinas",
    value: "32",
    change: "Em 12 cursos",
    changeType: "neutral" as const,
    icon: BookOpen,
    iconColor: "bg-warning/10 text-warning",
  },
  {
    title: "Turmas Ativas",
    value: "42",
    change: "98% de ocupação",
    changeType: "positive" as const,
    icon: School,
    iconColor: "bg-success/10 text-success",
  },
];

const Index = () => {
  return (
    <MainLayout 
      title="Painel de Controle" 
      subtitle="Bem-vindo de volta! Aqui está o resumo da sua escola."
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Right Column - Events & Actions */}
        <div className="space-y-6">
          <UpcomingEvents />
          <QuickActions />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
