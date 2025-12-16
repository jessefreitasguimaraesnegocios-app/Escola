import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const events = [
  {
    id: 1,
    title: "Conselho de Classe",
    date: "15 Jan",
    time: "14:00",
    type: "meeting",
  },
  {
    id: 2,
    title: "Prova Bimestral - Matemática",
    date: "18 Jan",
    time: "08:00",
    type: "exam",
  },
  {
    id: 3,
    title: "Reunião de Pais",
    date: "20 Jan",
    time: "19:00",
    type: "meeting",
  },
  {
    id: 4,
    title: "Entrega de Boletins",
    date: "25 Jan",
    time: "10:00",
    type: "deadline",
  },
];

const typeStyles: Record<string, string> = {
  meeting: "bg-info/10 text-info border-info/20",
  exam: "bg-warning/10 text-warning border-warning/20",
  deadline: "bg-destructive/10 text-destructive border-destructive/20",
};

export function UpcomingEvents() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
        Próximos Eventos
      </h3>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
              <span className="text-xs font-medium uppercase">
                {event.date.split(" ")[1]}
              </span>
              <span className="text-lg font-bold leading-none">
                {event.date.split(" ")[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {event.title}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="w-3 h-3" />
                {event.time}
              </div>
            </div>
            <Badge variant="outline" className={typeStyles[event.type]}>
              {event.type === "meeting" && "Reunião"}
              {event.type === "exam" && "Prova"}
              {event.type === "deadline" && "Prazo"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
