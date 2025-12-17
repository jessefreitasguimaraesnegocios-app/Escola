import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RefreshCw, Download, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { classesService } from "@/lib/supabase/classes";
import { schedulesService } from "@/lib/supabase/schedules";
import { useToast } from "@/hooks/use-toast";
import type { ClassWithTeacher } from "@/lib/supabase/classes";
import type { ScheduleWithDetails } from "@/lib/supabase/schedules";

const timeSlots = [
  { start: "07:00", end: "07:50", display: "07:00 - 07:50" },
  { start: "07:50", end: "08:40", display: "07:50 - 08:40" },
  { start: "08:50", end: "09:40", display: "08:50 - 09:40" },
  { start: "09:40", end: "10:30", display: "09:40 - 10:30" },
  { start: "10:40", end: "11:30", display: "10:40 - 11:30" },
  { start: "11:30", end: "12:20", display: "11:30 - 12:20" },
];

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const dayNameToNumber: Record<string, number> = {
  "Segunda": 0,
  "Terça": 1,
  "Quarta": 2,
  "Quinta": 3,
  "Sexta": 4,
};

const numberToDayName: Record<number, string> = {
  0: "Segunda",
  1: "Terça",
  2: "Quarta",
  3: "Quinta",
  4: "Sexta",
};

// Função para obter cor baseada no nome da disciplina ou usar cor padrão
const getSubjectColor = (color: string | null | undefined, subjectName: string): string => {
  if (color) {
    // Se a cor vem do banco, usar ela
    const baseColor = color.replace('bg-', '').replace('/20', '').replace('border-', '');
    return `bg-${baseColor}/20 border-${baseColor}`;
  }
  
  // Cores padrão baseadas no nome
  const colors: Record<string, string> = {
    "matemática": "bg-chart-1/20 border-chart-1",
    "português": "bg-chart-2/20 border-chart-2",
    "ciências": "bg-chart-3/20 border-chart-3",
    "química": "bg-chart-4/20 border-chart-4",
    "história": "bg-chart-5/20 border-chart-5",
    "geografia": "bg-chart-3/20 border-chart-3",
    "biologia": "bg-chart-2/20 border-chart-2",
    "física": "bg-chart-3/20 border-chart-3",
  };
  
  const normalizedName = subjectName.toLowerCase();
  for (const [key, value] of Object.entries(colors)) {
    if (normalizedName.includes(key)) {
      return value;
    }
  }
  
  return "bg-muted/20 border-border";
};

const Horarios = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassWithTeacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassWithTeacher | null>(null);
  const [scheduleData, setScheduleData] = useState<Record<string, Record<string, { subject: string; teacher: string; color: string } | null>>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Carregar turmas
  useEffect(() => {
    loadClasses();
  }, []);

  // Carregar horários quando a turma mudar
  useEffect(() => {
    if (selectedClassId) {
      loadSchedules();
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesService.getAll();
      setClasses(data);
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
        setSelectedClass(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar turmas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    if (!selectedClassId) return;

    try {
      setLoading(true);
      const schedules = await schedulesService.getByClass(selectedClassId);
      
      // Converter para o formato esperado
      const formattedData: Record<string, Record<string, { subject: string; teacher: string; color: string } | null>> = {};
      
      // Inicializar todos os dias e horários como null
      days.forEach(day => {
        formattedData[day] = {};
        timeSlots.forEach(slot => {
          formattedData[day][slot.display] = null;
        });
      });

      // Preencher com dados reais
      schedules.forEach(schedule => {
        const dayName = numberToDayName[schedule.day_of_week];
        const timeSlot = timeSlots.find(ts => ts.start === schedule.start_time && ts.end === schedule.end_time);
        
        if (dayName && timeSlot && schedule.subject && schedule.teacher) {
          formattedData[dayName][timeSlot.display] = {
            subject: schedule.subject.name,
            teacher: schedule.teacher.full_name,
            color: getSubjectColor(schedule.subject.color, schedule.subject.name),
          };
        }
      });

      setScheduleData(formattedData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar horários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === classId);
    setSelectedClass(cls || null);
  };

  const handleGenerateSchedule = async () => {
    if (!selectedClassId) {
      toast({
        title: "Atenção",
        description: "Selecione uma turma primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      
      const schedules = await schedulesService.generateAutomaticSchedule(
        selectedClassId,
        timeSlots.map(ts => ({ start: ts.start, end: ts.end })),
        days
      );

      toast({
        title: "Sucesso",
        description: `Horário gerado automaticamente com ${schedules.length} aulas`,
      });

      // Recarregar horários
      await loadSchedules();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar horário automaticamente",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    // Criar dados CSV
    const csvRows: string[] = [];
    
    // Cabeçalho
    const headers = ["Horário", ...days];
    csvRows.push(headers.join(","));
    
    // Dados
    timeSlots.forEach((slot) => {
      const row: string[] = [slot.display];
      days.forEach((day) => {
        const lesson = scheduleData[day]?.[slot.display];
        if (lesson) {
          row.push(`"${lesson.subject} - ${lesson.teacher}"`);
        } else {
          row.push("");
        }
      });
      csvRows.push(row.join(","));
    });
    
    // Criar arquivo CSV
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const className = selectedClass?.name || "turma";
    link.setAttribute("href", url);
    link.setAttribute("download", `horario_${className}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout title="Horários" subtitle="Visualize e gerencie os horários das turmas">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select value={selectedClassId} onValueChange={handleClassChange} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClass && (
              <Badge variant="secondary">
                Turno: {selectedClass.shift === "morning" ? "Manhã" : selectedClass.shift === "afternoon" ? "Tarde" : "Noite"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleGenerateSchedule}
              disabled={generating || !selectedClassId}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Gerar Automaticamente
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Grade Horária - {selectedClass?.name || "Selecione uma turma"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-muted-foreground border-b border-border w-28">
                      Horário
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className="p-3 text-center text-sm font-semibold text-foreground border-b border-border"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, index) => (
                    <tr
                      key={slot.display}
                      className={cn(
                        "animate-fade-in",
                        index % 2 === 0 ? "bg-muted/30" : ""
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
                        {slot.display}
                      </td>
                      {days.map((day) => {
                        const lesson = scheduleData[day]?.[slot.display];
                        return (
                          <td key={`${day}-${slot.display}`} className="p-2">
                            {lesson ? (
                              <div
                                className={cn(
                                  "p-2 rounded-lg border-l-4 transition-all hover:scale-[1.02]",
                                  lesson.color
                                )}
                              >
                                <p className="font-medium text-sm text-foreground">
                                  {lesson.subject}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.teacher}
                                </p>
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-muted/50 text-center text-xs text-muted-foreground">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {[
            { subject: "Matemática", color: "bg-chart-1" },
            { subject: "Português", color: "bg-chart-2" },
            { subject: "Ciências", color: "bg-chart-3" },
            { subject: "Química", color: "bg-chart-4" },
            { subject: "Humanas", color: "bg-chart-5" },
          ].map((item) => (
            <div key={item.subject} className="flex items-center gap-2 text-sm">
              <div className={cn("w-3 h-3 rounded", item.color)} />
              <span className="text-muted-foreground">{item.subject}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Horarios;
