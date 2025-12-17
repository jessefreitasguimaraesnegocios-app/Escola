import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Save, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { gradesService, type GradeWithDetails } from "@/lib/supabase/grades";
import { classesService } from "@/lib/supabase/classes";
import { subjectsService } from "@/lib/supabase/subjects";
import { studentsService } from "@/lib/supabase/students";
import { supabase } from "@/integrations/supabase/client";

interface GradeEntry {
  studentId: string;
  studentName: string;
  enrollment: string;
  bim1: { periodId: string; score: number | null; gradeId?: string };
  bim2: { periodId: string; score: number | null; gradeId?: string };
  bim3: { periodId: string; score: number | null; gradeId?: string };
  bim4: { periodId: string; score: number | null; gradeId?: string };
  average: number | null;
  status: "approved" | "failed" | "pending";
}

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
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradingPeriods, setGradingPeriods] = useState<Array<{ id: string; period_number: number; name: string }>>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      loadGrades();
    }
  }, [selectedClassId, selectedSubjectId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesData, subjectsData, periodsData] = await Promise.all([
        classesService.getAll(),
        subjectsService.getAll(),
        supabase
          .from('grading_periods')
          .select('id, period_number, name')
          .eq('academic_year', 2024)
          .eq('period_type', 'bimonthly')
          .order('period_number', { ascending: true })
      ]);

      setClasses(classesData.map(c => ({ id: c.id, name: c.name })));
      setSubjects(subjectsData.map(s => ({ id: s.id, name: s.name, code: s.code })));
      
      if (periodsData.data) {
        setGradingPeriods(periodsData.data);
      }

      // Selecionar primeira turma e disciplina por padrão
      if (classesData.length > 0 && subjectsData.length > 0) {
        setSelectedClassId(classesData[0].id);
        setSelectedSubjectId(subjectsData[0].id);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    if (!selectedClassId || !selectedSubjectId) return;

    try {
      setLoading(true);
      
      // Buscar alunos da turma
      const students = await studentsService.getAll();
      const classStudents = students.filter(s => s.class_id === selectedClassId);

      // Buscar períodos de avaliação primeiro
      const { data: periodsData } = await supabase
        .from('grading_periods')
        .select('id, period_number, name')
        .eq('academic_year', 2024)
        .eq('period_type', 'bimonthly')
        .order('period_number', { ascending: true });

      if (!periodsData || periodsData.length === 0) {
        toast.error("Nenhum período de avaliação encontrado para 2024. Configure os períodos primeiro.");
        setLoading(false);
        return;
      }

      // Buscar notas existentes
      const gradesData = await gradesService.getByClassAndSubject(selectedClassId, selectedSubjectId, 2024);

      // Organizar notas por aluno e período
      const gradesMap = new Map<string, Map<number, GradeWithDetails>>();
      gradesData.forEach(grade => {
        if (grade.student && grade.grading_period) {
          const studentId = grade.student.id;
          const periodNumber = grade.grading_period.period_number;
          
          if (!gradesMap.has(studentId)) {
            gradesMap.set(studentId, new Map());
          }
          gradesMap.get(studentId)!.set(periodNumber, grade);
        }
      });

      // Criar estrutura de notas
      const formattedGrades: GradeEntry[] = classStudents.map(student => {
        const period1 = gradesMap.get(student.id)?.get(1);
        const period2 = gradesMap.get(student.id)?.get(2);
        const period3 = gradesMap.get(student.id)?.get(3);
        const period4 = gradesMap.get(student.id)?.get(4);

        const period1Id = periodsData.find(p => p.period_number === 1)?.id || '';
        const period2Id = periodsData.find(p => p.period_number === 2)?.id || '';
        const period3Id = periodsData.find(p => p.period_number === 3)?.id || '';
        const period4Id = periodsData.find(p => p.period_number === 4)?.id || '';

        const bim1Score = period1?.score ? Number(period1.score) : null;
        const bim2Score = period2?.score ? Number(period2.score) : null;
        const bim3Score = period3?.score ? Number(period3.score) : null;
        const bim4Score = period4?.score ? Number(period4.score) : null;

        const { average, status } = calculateAverageAndStatus(bim1Score, bim2Score, bim3Score, bim4Score);

        return {
          studentId: student.id,
          studentName: student.full_name,
          enrollment: student.registration_number,
          bim1: { periodId: period1Id, score: bim1Score, gradeId: period1?.id },
          bim2: { periodId: period2Id, score: bim2Score, gradeId: period2?.id },
          bim3: { periodId: period3Id, score: bim3Score, gradeId: period3?.id },
          bim4: { periodId: period4Id, score: bim4Score, gradeId: period4?.id },
          average,
          status,
        };
      });

      setGrades(formattedGrades);
    } catch (error: any) {
      toast.error("Erro ao carregar notas: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, field: "bim1" | "bim2" | "bim3" | "bim4", value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    if (numValue !== null && (isNaN(numValue) || numValue < 0 || numValue > 10)) {
      return; // Ignorar valores inválidos
    }

    setGrades((prevGrades) => {
      const updatedGrades = prevGrades.map((grade) => {
        if (grade.studentId === studentId) {
          const updatedGrade = {
            ...grade,
            [field]: {
              ...grade[field],
              score: numValue,
            },
          };
          const { average, status } = calculateAverageAndStatus(
            updatedGrade.bim1.score,
            updatedGrade.bim2.score,
            updatedGrade.bim3.score,
            updatedGrade.bim4.score
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

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      toast.error("Por favor, selecione uma turma e uma disciplina.");
      return;
    }

    try {
      setSaving(true);

      // Preparar dados para salvar
      const gradesToSave: Array<{
        student_id: string;
        subject_id: string;
        grading_period_id: string;
        score: number | null;
      }> = [];

      grades.forEach(grade => {
        // Bimestre 1
        if (grade.bim1.periodId) {
          gradesToSave.push({
            student_id: grade.studentId,
            subject_id: selectedSubjectId,
            grading_period_id: grade.bim1.periodId,
            score: grade.bim1.score,
          });
        }
        // Bimestre 2
        if (grade.bim2.periodId) {
          gradesToSave.push({
            student_id: grade.studentId,
            subject_id: selectedSubjectId,
            grading_period_id: grade.bim2.periodId,
            score: grade.bim2.score,
          });
        }
        // Bimestre 3
        if (grade.bim3.periodId) {
          gradesToSave.push({
            student_id: grade.studentId,
            subject_id: selectedSubjectId,
            grading_period_id: grade.bim3.periodId,
            score: grade.bim3.score,
          });
        }
        // Bimestre 4
        if (grade.bim4.periodId) {
          gradesToSave.push({
            student_id: grade.studentId,
            subject_id: selectedSubjectId,
            grading_period_id: grade.bim4.periodId,
            score: grade.bim4.score,
          });
        }
      });

      // Salvar notas
      await gradesService.upsertGrades(gradesToSave);

      toast.success("Notas salvas com sucesso!");
      
      // Recarregar notas para atualizar IDs
      await loadGrades();
    } catch (error: any) {
      console.error("Erro ao salvar notas:", error);
      toast.error("Erro ao salvar notas: " + (error?.message || "Erro desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || "";
  const selectedSubjectName = subjects.find(s => s.id === selectedSubjectId)?.name || "";

  if (loading && grades.length === 0) {
    return (
      <MainLayout title="Notas" subtitle="Gerencie as notas e avaliações dos alunos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Notas" subtitle="Gerencie as notas e avaliações dos alunos">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary">Ano Letivo: 2024</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving || !selectedClassId || !selectedSubjectId}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Grades Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5" />
              {selectedSubjectName} - {selectedClassName}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {grades.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {selectedClassId && selectedSubjectId 
                  ? "Nenhum aluno encontrado nesta turma."
                  : "Selecione uma turma e uma disciplina para ver as notas."}
              </p>
            ) : (
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
                        key={grade.studentId}
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
                            value={grade.bim1.score ?? ""}
                            onChange={(e) => handleGradeChange(grade.studentId, "bim1", e.target.value)}
                            className={cn(
                              "w-full text-center h-9",
                              getGradeColor(grade.bim1.score)
                            )}
                            disabled={saving}
                          />
                        </td>
                        <td className="p-3 border-b border-border">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={grade.bim2.score ?? ""}
                            onChange={(e) => handleGradeChange(grade.studentId, "bim2", e.target.value)}
                            className={cn(
                              "w-full text-center h-9",
                              getGradeColor(grade.bim2.score)
                            )}
                            disabled={saving}
                          />
                        </td>
                        <td className="p-3 border-b border-border">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={grade.bim3.score ?? ""}
                            onChange={(e) => handleGradeChange(grade.studentId, "bim3", e.target.value)}
                            className={cn(
                              "w-full text-center h-9",
                              getGradeColor(grade.bim3.score)
                            )}
                            disabled={saving}
                          />
                        </td>
                        <td className="p-3 border-b border-border">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={grade.bim4.score ?? ""}
                            onChange={(e) => handleGradeChange(grade.studentId, "bim4", e.target.value)}
                            className={cn(
                              "w-full text-center h-9",
                              getGradeColor(grade.bim4.score)
                            )}
                            disabled={saving}
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
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {grades.length > 0 && (
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
        )}
      </div>
    </MainLayout>
  );
};

export default Notas;
