import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { useState } from "react";

const timeSlots = [
  "07:00 - 07:50",
  "07:50 - 08:40",
  "08:50 - 09:40",
  "09:40 - 10:30",
  "10:40 - 11:30",
  "11:30 - 12:20",
];

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

const scheduleData: Record<string, Record<string, { subject: string; teacher: string; color: string } | null>> = {
  "Segunda": {
    "07:00 - 07:50": { subject: "Matemática", teacher: "Maria Santos", color: "bg-chart-1/20 border-chart-1" },
    "07:50 - 08:40": { subject: "Matemática", teacher: "Maria Santos", color: "bg-chart-1/20 border-chart-1" },
    "08:50 - 09:40": { subject: "Português", teacher: "Ana Paula", color: "bg-chart-2/20 border-chart-2" },
    "09:40 - 10:30": { subject: "Português", teacher: "Ana Paula", color: "bg-chart-2/20 border-chart-2" },
    "10:40 - 11:30": { subject: "História", teacher: "Roberto Lima", color: "bg-chart-5/20 border-chart-5" },
    "11:30 - 12:20": { subject: "Geografia", teacher: "Roberto Lima", color: "bg-chart-3/20 border-chart-3" },
  },
  "Terça": {
    "07:00 - 07:50": { subject: "Física", teacher: "Carlos Oliveira", color: "bg-chart-3/20 border-chart-3" },
    "07:50 - 08:40": { subject: "Física", teacher: "Carlos Oliveira", color: "bg-chart-3/20 border-chart-3" },
    "08:50 - 09:40": { subject: "Química", teacher: "Carlos Oliveira", color: "bg-chart-4/20 border-chart-4" },
    "09:40 - 10:30": { subject: "Química", teacher: "Carlos Oliveira", color: "bg-chart-4/20 border-chart-4" },
    "10:40 - 11:30": { subject: "Biologia", teacher: "Fernanda Costa", color: "bg-chart-2/20 border-chart-2" },
    "11:30 - 12:20": { subject: "Biologia", teacher: "Fernanda Costa", color: "bg-chart-2/20 border-chart-2" },
  },
  "Quarta": {
    "07:00 - 07:50": { subject: "Matemática", teacher: "Maria Santos", color: "bg-chart-1/20 border-chart-1" },
    "07:50 - 08:40": { subject: "Matemática", teacher: "Maria Santos", color: "bg-chart-1/20 border-chart-1" },
    "08:50 - 09:40": { subject: "Ed. Física", teacher: "Pedro Almeida", color: "bg-chart-5/20 border-chart-5" },
    "09:40 - 10:30": { subject: "Ed. Física", teacher: "Pedro Almeida", color: "bg-chart-5/20 border-chart-5" },
    "10:40 - 11:30": { subject: "Inglês", teacher: "Laura Mendes", color: "bg-chart-4/20 border-chart-4" },
    "11:30 - 12:20": { subject: "Artes", teacher: "Paula Santos", color: "bg-chart-3/20 border-chart-3" },
  },
  "Quinta": {
    "07:00 - 07:50": { subject: "Português", teacher: "Ana Paula", color: "bg-chart-2/20 border-chart-2" },
    "07:50 - 08:40": { subject: "Português", teacher: "Ana Paula", color: "bg-chart-2/20 border-chart-2" },
    "08:50 - 09:40": { subject: "Física", teacher: "Carlos Oliveira", color: "bg-chart-3/20 border-chart-3" },
    "09:40 - 10:30": { subject: "História", teacher: "Roberto Lima", color: "bg-chart-5/20 border-chart-5" },
    "10:40 - 11:30": { subject: "Geografia", teacher: "Roberto Lima", color: "bg-chart-3/20 border-chart-3" },
    "11:30 - 12:20": { subject: "Filosofia", teacher: "Marcos Silva", color: "bg-chart-1/20 border-chart-1" },
  },
  "Sexta": {
    "07:00 - 07:50": { subject: "Química", teacher: "Carlos Oliveira", color: "bg-chart-4/20 border-chart-4" },
    "07:50 - 08:40": { subject: "Biologia", teacher: "Fernanda Costa", color: "bg-chart-2/20 border-chart-2" },
    "08:50 - 09:40": { subject: "Matemática", teacher: "Maria Santos", color: "bg-chart-1/20 border-chart-1" },
    "09:40 - 10:30": { subject: "Português", teacher: "Ana Paula", color: "bg-chart-2/20 border-chart-2" },
    "10:40 - 11:30": { subject: "Sociologia", teacher: "Marcos Silva", color: "bg-chart-5/20 border-chart-5" },
    "11:30 - 12:20": null,
  },
};

const Horarios = () => {
  const [selectedClass, setSelectedClass] = useState("9a");

  const handleExport = () => {
    // Criar dados CSV
    const csvRows: string[] = [];
    
    // Cabeçalho
    const headers = ["Horário", ...days];
    csvRows.push(headers.join(","));
    
    // Dados
    timeSlots.forEach((slot) => {
      const row: string[] = [slot];
      days.forEach((day) => {
        const lesson = scheduleData[day]?.[slot];
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
    
    link.setAttribute("href", url);
    link.setAttribute("download", `horario_${selectedClass}_${new Date().toISOString().split("T")[0]}.csv`);
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
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7a">7º Ano A</SelectItem>
                <SelectItem value="7b">7º Ano B</SelectItem>
                <SelectItem value="8a">8º Ano A</SelectItem>
                <SelectItem value="8b">8º Ano B</SelectItem>
                <SelectItem value="9a">9º Ano A</SelectItem>
                <SelectItem value="9b">9º Ano B</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">Turno: Manhã</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
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
              Grade Horária - 9º Ano A
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
                      key={slot}
                      className={cn(
                        "animate-fade-in",
                        index % 2 === 0 ? "bg-muted/30" : ""
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-3 text-sm font-medium text-muted-foreground border-r border-border">
                        {slot}
                      </td>
                      {days.map((day) => {
                        const lesson = scheduleData[day]?.[slot];
                        return (
                          <td key={`${day}-${slot}`} className="p-2">
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
