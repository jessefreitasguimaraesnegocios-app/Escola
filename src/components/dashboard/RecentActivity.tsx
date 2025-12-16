import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    user: "Prof. Maria Santos",
    initials: "MS",
    action: "lançou notas",
    target: "Matemática - 9º Ano A",
    time: "há 5 minutos",
    type: "grades",
  },
  {
    id: 2,
    user: "João Pedro Silva",
    initials: "JS",
    action: "matriculou-se em",
    target: "Ensino Médio - 1º Ano",
    time: "há 15 minutos",
    type: "enrollment",
  },
  {
    id: 3,
    user: "Prof. Carlos Oliveira",
    initials: "CO",
    action: "criou avaliação",
    target: "Física - Prova Bimestral",
    time: "há 1 hora",
    type: "exam",
  },
  {
    id: 4,
    user: "Ana Beatriz Lima",
    initials: "AL",
    action: "solicitou transferência",
    target: "para 8º Ano B",
    time: "há 2 horas",
    type: "transfer",
  },
  {
    id: 5,
    user: "Secretaria",
    initials: "SC",
    action: "atualizou calendário",
    target: "Feriado - 15 de Novembro",
    time: "há 3 horas",
    type: "calendar",
  },
];

const typeColors: Record<string, string> = {
  grades: "bg-success/10 text-success",
  enrollment: "bg-info/10 text-info",
  exam: "bg-warning/10 text-warning",
  transfer: "bg-primary/10 text-primary",
  calendar: "bg-accent/10 text-accent-foreground",
};

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
        Atividade Recente
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className={typeColors[activity.type]}>
                {activity.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
