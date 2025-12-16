import { UserPlus, BookPlus, CalendarPlus, ClipboardEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const actions = [
  {
    icon: UserPlus,
    label: "Novo Aluno",
    description: "Cadastrar aluno",
    href: "/alunos?new=true",
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    icon: BookPlus,
    label: "Nova Disciplina",
    description: "Adicionar matéria",
    href: "/disciplinas?new=true",
    color: "bg-info/10 text-info hover:bg-info/20",
  },
  {
    icon: CalendarPlus,
    label: "Novo Evento",
    description: "Agendar evento",
    href: "/calendario?new=true",
    color: "bg-warning/10 text-warning hover:bg-warning/20",
  },
  {
    icon: ClipboardEdit,
    label: "Lançar Notas",
    description: "Registrar avaliações",
    href: "/notas?new=true",
    color: "bg-success/10 text-success hover:bg-success/20",
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.href}
            className="group animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${action.color}`}
            >
              <action.icon className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">{action.label}</span>
              <span className="text-xs opacity-70">{action.description}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
