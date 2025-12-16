import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Save, Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

interface GradeEntry {
  id: string;
  studentName: string;
  enrollment: string;
  bim1: number | null;
  bim2: number | null;
  bim3: number | null;
  bim4: number | null;
  average: number | null;
  status: "approved" | "failed" | "pending";
}

const initialGrades: GradeEntry[] = [
  { id: "1", studentName: "Ana Silva Santos", enrollment: "2024001", bim1: 8.5, bim2: 7.8, bim3: 9.0, bim4: 8.2, average: 8.4, status: "approved" },
  { id: "2", studentName: "Bruno Costa Oliveira", enrollment: "2024002", bim1: 6.0, bim2: 5.5, bim3: 6.8, bim4: 7.0, average: 6.3, status: "approved" },
  { id: "3", studentName: "Carla Mendes Lima", enrollment: "2024003", bim1: 9.2, bim2: 9.5, bim3: 9.0, bim4: 9.8, average: 9.4, status: "approved" },
  { id: "4", studentName: "Daniel Ferreira Souza", enrollment: "2024004", bim1: 4.5, bim2: 5.0, bim3: 4.8, bim4: null, average: null, status: "pending" },
  { id: "5", studentName: "Elena Rodrigues Alves", enrollment: "2024005", bim1: 7.5, bim2: 8.0, bim3: 7.2, bim4: 7.8, average: 7.6, status: "approved" },
  { id: "6", studentName: "Felipe Martins Pereira", enrollment: "2024006", bim1: 3.5, bim2: 4.0, bim3: 4.5, bim4: 4.2, average: 4.1, status: "failed" },
  { id: "7", studentName: "Gabriela Santos Costa", enrollment: "2024007", bim1: 8.0, bim2: 8.5, bim3: null, bim4: null, average: null, status: "pending" },
  { id: "8", studentName: "Hugo Almeida Silva", enrollment: "2024008", bim1: 7.0, bim2: 6.5, bim3: 7.5, bim4: 7.2, average: 7.1, status: "approved" },
];

// Função para calcular média e status
const calculateAverageAndStatus = (bim1: number | null, bim2: number | null, bim3: number | null, bim4: number | null): { average: number | null; status: "approved" | "failed" | "pending" } => {
  const grades = [bim1, bim2, bim3, bim4].filter((g) => g !== null && g !== undefined) as number[];
  
  if (grades.length === 0) {
    return { average: null, status: "pending" };
  }
  
  const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
  
  // Se todos os 4 bimestres estão preenchidos
  if (grades.length === 4) {
    return {
      average: Math.round(average * 10) / 10,
      status: average >= 7 ? "approved" : average >= 5 ? "pending" : "failed",
    };
  }
  
  // Se ainda faltam notas
  return {
    average: Math.round(average * 10) / 10,
    status: "pending",
  };
};

const statusConfig = {
  approved: { label: "Aprovado", className: "bg-success/10 text-success border-success/20" },
  failed: { label: "Reprovado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
};

const getGradeColor = (grade: number | null) => {
  if (grade === null) return "text-muted-foreground";
  if (grade >= 7) return "text-success";
  if (grade >= 5) return "text-warning";
  return "text-destructive";
};

const Notas = () => {
  const [selectedClass, setSelectedClass] = useState("9a");
  const [selectedSubject, setSelectedSubject] = useState("mat");
  const [grades, setGrades] = useState<GradeEntry[]>(initialGrades);

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          alert("Arquivo CSV inválido. Deve conter pelo menos o cabeçalho e uma linha de dados.");
          return;
        }

        // Processar cabeçalho
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
        
        // Verificar se o cabeçalho está correto
        const expectedHeaders = ["Matrícula", "Aluno", "1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];
        const hasValidHeaders = expectedHeaders.every((h) => 
          headers.some((header) => header.toLowerCase().includes(h.toLowerCase().replace("º", "").replace(" ", "")))
        );

        if (!hasValidHeaders) {
          alert("Formato de arquivo inválido. O CSV deve conter as colunas: Matrícula, Aluno, 1º Bimestre, 2º Bimestre, 3º Bimestre, 4º Bimestre");
          return;
        }

        // Processar dados
        const importedGrades: GradeEntry[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
          
          if (values.length < 2) continue;

          // Encontrar índices das colunas
          const enrollmentIndex = headers.findIndex((h) => h.toLowerCase().includes("matrícula") || h.toLowerCase().includes("matricula"));
          const nameIndex = headers.findIndex((h) => h.toLowerCase().includes("aluno") || h.toLowerCase().includes("nome"));
          const bim1Index = headers.findIndex((h) => h.toLowerCase().includes("1") && h.toLowerCase().includes("bim"));
          const bim2Index = headers.findIndex((h) => h.toLowerCase().includes("2") && h.toLowerCase().includes("bim"));
          const bim3Index = headers.findIndex((h) => h.toLowerCase().includes("3") && h.toLowerCase().includes("bim"));
          const bim4Index = headers.findIndex((h) => h.toLowerCase().includes("4") && h.toLowerCase().includes("bim"));

          const enrollment = values[enrollmentIndex] || "";
          const studentName = values[nameIndex] || "";
          
          if (!enrollment || !studentName) continue;

          const bim1 = values[bim1Index] ? parseFloat(values[bim1Index]) : null;
          const bim2 = values[bim2Index] ? parseFloat(values[bim2Index]) : null;
          const bim3 = values[bim3Index] ? parseFloat(values[bim3Index]) : null;
          const bim4 = values[bim4Index] ? parseFloat(values[bim4Index]) : null;

          const { average, status } = calculateAverageAndStatus(bim1, bim2, bim3, bim4);

          // Verificar se já existe um aluno com essa matrícula
          const existingGradeIndex = grades.findIndex((g) => g.enrollment === enrollment);
          
          if (existingGradeIndex >= 0) {
            // Atualizar nota existente
            const updatedGrades = [...grades];
            updatedGrades[existingGradeIndex] = {
              ...updatedGrades[existingGradeIndex],
              bim1: isNaN(bim1 || 0) ? updatedGrades[existingGradeIndex].bim1 : bim1,
              bim2: isNaN(bim2 || 0) ? updatedGrades[existingGradeIndex].bim2 : bim2,
              bim3: isNaN(bim3 || 0) ? updatedGrades[existingGradeIndex].bim3 : bim3,
              bim4: isNaN(bim4 || 0) ? updatedGrades[existingGradeIndex].bim4 : bim4,
              average,
              status,
            };
            setGrades(updatedGrades);
          } else {
            // Adicionar novo aluno
            importedGrades.push({
              id: String(grades.length + importedGrades.length + 1),
              studentName,
              enrollment,
              bim1: isNaN(bim1 || 0) ? null : bim1,
              bim2: isNaN(bim2 || 0) ? null : bim2,
              bim3: isNaN(bim3 || 0) ? null : bim3,
              bim4: isNaN(bim4 || 0) ? null : bim4,
              average,
              status,
            });
          }
        }

        if (importedGrades.length > 0) {
          setGrades([...grades, ...importedGrades]);
        }

        alert(`Importação concluída! ${importedGrades.length > 0 ? `${importedGrades.length} novo(s) aluno(s) adicionado(s).` : "Notas atualizadas."}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    // Criar dados CSV
    const csvRows: string[] = [];
    
    // Cabeçalho
    const headers = ["Matrícula", "Aluno", "1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre", "Média", "Situação"];
    csvRows.push(headers.join(","));
    
    // Dados
    grades.forEach((grade) => {
      const row = [
        grade.enrollment,
        `"${grade.studentName}"`,
        grade.bim1?.toFixed(1) ?? "",
        grade.bim2?.toFixed(1) ?? "",
        grade.bim3?.toFixed(1) ?? "",
        grade.bim4?.toFixed(1) ?? "",
        grade.average?.toFixed(1) ?? "",
        statusConfig[grade.status].label,
      ];
      csvRows.push(row.join(","));
    });
    
    // Criar arquivo CSV
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const subjectNames: Record<string, string> = {
      mat: "Matematica",
      por: "Portugues",
      fis: "Fisica",
      qui: "Quimica",
      bio: "Biologia",
    };
    
    link.setAttribute("href", url);
    link.setAttribute("download", `notas_${subjectNames[selectedSubject] || "disciplina"}_${selectedClass}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGradeChange = (gradeId: string, field: "bim1" | "bim2" | "bim3" | "bim4", value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    if (numValue !== null && (isNaN(numValue) || numValue < 0 || numValue > 10)) {
      return; // Ignorar valores inválidos
    }

    setGrades((prevGrades) => {
      const updatedGrades = prevGrades.map((grade) => {
        if (grade.id === gradeId) {
          const updatedGrade = {
            ...grade,
            [field]: numValue,
          };
          const { average, status } = calculateAverageAndStatus(
            updatedGrade.bim1,
            updatedGrade.bim2,
            updatedGrade.bim3,
            updatedGrade.bim4
          );
          return {
            ...updatedGrade,
            average,
            status,
          };
        }
        return grade;
      });
      return updatedGrades;
    });
  };

  const handleSave = () => {
    // Recalcular todas as médias e status para garantir consistência
    const updatedGrades = grades.map((grade) => {
      const { average, status } = calculateAverageAndStatus(
        grade.bim1,
        grade.bim2,
        grade.bim3,
        grade.bim4
      );
      return {
        ...grade,
        average,
        status,
      };
    });

    setGrades(updatedGrades);
    
    // Aqui você pode adicionar lógica para salvar no backend
    // Por enquanto, apenas mostra uma mensagem de sucesso
    alert("Notas salvas com sucesso!");
  };

  return (
    <MainLayout title="Notas" subtitle="Gerencie as notas e avaliações dos alunos">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
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
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mat">Matemática</SelectItem>
                <SelectItem value="por">Português</SelectItem>
                <SelectItem value="fis">Física</SelectItem>
                <SelectItem value="qui">Química</SelectItem>
                <SelectItem value="bio">Biologia</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">Ano Letivo: 2024</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleImport}>
              <FileSpreadsheet className="w-4 h-4" />
              Importar
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button size="sm" className="gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Grades Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5" />
              Matemática - 9º Ano A
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left text-sm font-semibold text-foreground border-b border-border">
                      Aluno
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-foreground border-b border-border w-24">
                      1º Bim
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-foreground border-b border-border w-24">
                      2º Bim
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-foreground border-b border-border w-24">
                      3º Bim
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-foreground border-b border-border w-24">
                      4º Bim
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-foreground border-b border-border w-24">
                      Média
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-foreground border-b border-border w-28">
                      Situação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, index) => (
                    <tr
                      key={grade.id}
                      className={cn(
                        "animate-fade-in hover:bg-muted/30 transition-colors",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-3 border-b border-border">
                        <div>
                          <p className="font-medium text-sm text-foreground">{grade.studentName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{grade.enrollment}</p>
                        </div>
                      </td>
                      <td className="p-3 border-b border-border">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={grade.bim1 ?? ""}
                          onChange={(e) => handleGradeChange(grade.id, "bim1", e.target.value)}
                          className={cn(
                            "w-full text-center h-9",
                            getGradeColor(grade.bim1)
                          )}
                        />
                      </td>
                      <td className="p-3 border-b border-border">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={grade.bim2 ?? ""}
                          onChange={(e) => handleGradeChange(grade.id, "bim2", e.target.value)}
                          className={cn(
                            "w-full text-center h-9",
                            getGradeColor(grade.bim2)
                          )}
                        />
                      </td>
                      <td className="p-3 border-b border-border">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={grade.bim3 ?? ""}
                          onChange={(e) => handleGradeChange(grade.id, "bim3", e.target.value)}
                          className={cn(
                            "w-full text-center h-9",
                            getGradeColor(grade.bim3)
                          )}
                        />
                      </td>
                      <td className="p-3 border-b border-border">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={grade.bim4 ?? ""}
                          onChange={(e) => handleGradeChange(grade.id, "bim4", e.target.value)}
                          className={cn(
                            "w-full text-center h-9",
                            getGradeColor(grade.bim4)
                          )}
                        />
                      </td>
                      <td className="p-3 border-b border-border text-center">
                        <span
                          className={cn(
                            "font-bold text-lg",
                            getGradeColor(grade.average)
                          )}
                        >
                          {grade.average?.toFixed(1) ?? "—"}
                        </span>
                      </td>
                      <td className="p-3 border-b border-border text-center">
                        <Badge variant="outline" className={statusConfig[grade.status].className}>
                          {statusConfig[grade.status].label}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Média da Turma</p>
            <p className="text-2xl font-bold text-foreground">
              {(() => {
                const averages = grades.map((g) => g.average).filter((a) => a !== null) as number[];
                if (averages.length === 0) return "—";
                const classAverage = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
                return classAverage.toFixed(1);
              })()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Aprovados</p>
            <p className="text-2xl font-bold text-success">
              {grades.filter((g) => g.status === "approved").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Em Recuperação</p>
            <p className="text-2xl font-bold text-warning">
              {grades.filter((g) => g.status === "pending").length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Reprovados</p>
            <p className="text-2xl font-bold text-destructive">
              {grades.filter((g) => g.status === "failed").length}
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notas;
