import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { calendarService } from "@/lib/supabase/calendar";
import type { Database } from "@/integrations/supabase/types";

type EventType = Database['public']['Enums']['event_type'];

interface Event {
  id: string;
  title: string;
  date: string;
  type: EventType;
  description?: string;
}

const typeConfig: Record<string, { label: string; color: string; dot: string }> = {
  holiday: { label: "Feriado", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  exam: { label: "Prova", color: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning" },
  meeting: { label: "Reunião", color: "bg-info/10 text-info border-info/20", dot: "bg-info" },
  deadline: { label: "Prazo", color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  event: { label: "Evento", color: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  other: { label: "Outro", color: "bg-muted/10 text-muted border-muted/20", dot: "bg-muted" },
};

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "event" as EventType,
    description: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await calendarService.getAll();
      
      // Transformar dados do Supabase para o formato da interface
      const formattedEvents: Event[] = eventsData.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.start_date,
        type: (event.event_type || "other") as EventType,
        description: event.description || undefined,
      }));

      setEvents(formattedEvents);
    } catch (error: any) {
      toast.error("Erro ao carregar eventos: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    // Preencher data com o primeiro dia do mês atual se não houver seleção
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setFormData({
      title: "",
      date: defaultDate,
      type: "event",
      description: "",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.title || !formData.date) {
      toast.error("Por favor, preencha o título e a data do evento.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Criar evento
      await calendarService.create({
        title: formData.title,
        start_date: formData.date,
        event_type: formData.type,
        description: formData.description || null,
        all_day: true,
      });

      toast.success("Evento cadastrado com sucesso!");
      handleCloseDialog();
      loadEvents();
    } catch (error: any) {
      toast.error("Erro ao cadastrar evento: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Calendário Acadêmico" subtitle="Visualize e gerencie eventos do ano letivo">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Calendário Acadêmico" subtitle="Visualize e gerencie eventos do ano letivo">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Ano Letivo {year}</Badge>
          </div>
          <Button className="gap-2" onClick={handleOpenDialog}>
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {months[month]} {year}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-semibold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of month */}
                {Array.from({ length: firstDay }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2 min-h-[80px]" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday =
                    day === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      className={cn(
                        "p-2 min-h-[80px] rounded-lg border border-transparent transition-colors hover:border-border hover:bg-muted/30",
                        isToday && "bg-primary/5 border-primary/20"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isToday && "text-primary font-bold"
                        )}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded truncate",
                              typeConfig[event.type]?.color || typeConfig.other.color
                            )}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} mais
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
                ) : (
                  upcomingEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors animate-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn("w-2 h-2 rounded-full mt-2", typeConfig[event.type]?.dot || typeConfig.other.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", typeConfig[event.type]?.color || typeConfig.other.color)}>
                        {typeConfig[event.type]?.label || typeConfig.other.label}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded", config.dot)} />
                    <span className="text-sm text-muted-foreground">{config.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para Novo Evento */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Evento</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo evento no calendário.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Evento *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Reunião de Pais"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: EventType) =>
                        setFormData({ ...formData, type: value })
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="holiday">Feriado</SelectItem>
                        <SelectItem value="exam">Prova</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                        <SelectItem value="deadline">Prazo</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição opcional do evento..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Calendario;
