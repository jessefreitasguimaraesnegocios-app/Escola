import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Users, Clock, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { subjectsService } from "@/lib/supabase/subjects";
import { teachersService } from "@/lib/supabase/teachers";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Subject = Database['public']['Tables']['subjects']['Row'];

interface SubjectWithTeacher extends Subject {
  teacher?: string;
  classesCount?: number;
}

const availableColors = [
  { value: "bg-chart-1", label: "Azul" },
  { value: "bg-chart-2", label: "Verde" },
  { value: "bg-chart-3", label: "Amarelo" },
  { value: "bg-chart-4", label: "Laranja" },
  { value: "bg-chart-5", label: "Roxo" },
];

// Função para gerar código da disciplina baseado no nome
const generateCode = (name: string): string => {
  const words = name.split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase() + "001";
  }
  const initials = words.map((w) => w[0]).join("").toUpperCase();
  return initials.substring(0, 3) + "001";
};

const Disciplinas = () => {
  const [subjects, setSubjects] = useState<SubjectWithTeacher[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithTeacher | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithTeacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacherId: "",
    hours: "",
    color: "bg-chart-1",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, teachersData] = await Promise.all([
        subjectsService.getAll(),
        teachersService.getAll(),
      ]);

      // Buscar professores para cada disciplina e contagem de turmas
      const subjectsWithData = await Promise.all(
        subjectsData.map(async (subject) => {
          // Buscar professores que lecionam esta disciplina
          const { data: teacherSubjects } = await supabase
            .from('teacher_subjects')
            .select('teacher:teachers!inner(full_name)')
            .eq('subject_id', subject.id)
            .limit(1);

          // Contar turmas que têm esta disciplina
          const { count } = await supabase
            .from('teacher_subjects')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id);

          return {
            ...subject,
            teacher: (teacherSubjects?.[0] as any)?.teacher?.full_name || "Sem professor",
            classesCount: count || 0,
          };
        })
      );

      setSubjects(subjectsWithData);
      setTeachers(teachersData.map(t => ({ id: t.id, full_name: t.full_name })));
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingSubject(null);
    setIsDialogOpen(true);
    setFormData({
      name: "",
      code: "",
      teacherId: "",
      hours: "",
      color: "bg-chart-1",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubject(null);
    setFormData({
      name: "",
      code: "",
      teacherId: "",
      hours: "",
      color: "bg-chart-1",
    });
  };

  const handleEdit = async (subject: SubjectWithTeacher) => {
    try {
      // Buscar professor associado
      const { data: teacherSubjects } = await supabase
        .from('teacher_subjects')
        .select('teacher_id')
        .eq('subject_id', subject.id)
        .limit(1);

      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        teacherId: teacherSubjects?.[0]?.teacher_id || "",
        hours: subject.workload_hours?.toString() || "",
        color: subject.color || "bg-chart-1",
      });
      setIsDialogOpen(true);
    } catch (error: any) {
      toast.error("Erro ao carregar dados da disciplina: " + error.message);
    }
  };

  const handleDeleteClick = (subject: SubjectWithTeacher) => {
    setDeletingSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return;

    try {
      await subjectsService.delete(deletingSubject.id);
      toast.success("Disciplina excluída com sucesso!");
      setIsDeleteDialogOpen(false);
      setDeletingSubject(null);
      loadData();
    } catch (error: any) {
      toast.error("Erro ao excluir disciplina: " + error.message);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      code: prev.code || generateCode(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validação básica
    if (!formData.name || !formData.hours) {
      toast.error("Por favor, preencha o nome e as horas da disciplina.");
      return;
    }

    // Validar horas
    const hours = parseInt(formData.hours);
    if (isNaN(hours) || hours <= 0) {
      toast.error("Por favor, informe um número válido de horas.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingSubject) {
        // Atualizar disciplina
        await subjectsService.update(editingSubject.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          workload_hours: hours,
          color: formData.color,
        });

        // Atualizar associação com professor
        // Remover associações antigas
        await supabase
          .from('teacher_subjects')
          .delete()
          .eq('subject_id', editingSubject.id);

        // Adicionar nova associação (se fornecido)
        if (formData.teacherId && formData.teacherId.trim() !== '') {
          const { error: teacherSubjectError } = await supabase
            .from('teacher_subjects')
            .insert({
              teacher_id: formData.teacherId,
              subject_id: editingSubject.id,
            });
          
          if (teacherSubjectError) {
            console.error('Erro ao associar professor:', teacherSubjectError);
            toast.warning("Disciplina atualizada, mas houve erro ao associar o professor.");
          }
        }

        toast.success("Disciplina atualizada com sucesso!");
      } else {
        // Criar disciplina
        const newSubject = await subjectsService.create({
          name: formData.name.trim(),
          code: (formData.code || generateCode(formData.name)).trim().toUpperCase(),
          workload_hours: hours,
          color: formData.color,
        });

        if (!newSubject) {
          throw new Error("Não foi possível criar a disciplina");
        }

        // Associar professor à disciplina (se fornecido)
        if (formData.teacherId && formData.teacherId.trim() !== '') {
          const { error: teacherSubjectError } = await supabase
            .from('teacher_subjects')
            .insert({
              teacher_id: formData.teacherId,
              subject_id: newSubject.id,
            });
          
          if (teacherSubjectError) {
            console.error('Erro ao associar professor:', teacherSubjectError);
            toast.warning("Disciplina criada, mas houve erro ao associar o professor. Você pode associar depois.");
          }
        }

        toast.success("Disciplina cadastrada com sucesso!");
      }

      handleCloseDialog();
      await loadData();
    } catch (error: any) {
      console.error("Erro ao salvar disciplina:", error);
      const errorMessage = error?.message || error?.error?.message || "Erro desconhecido";
      toast.error((editingSubject ? "Erro ao atualizar disciplina: " : "Erro ao cadastrar disciplina: ") + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Disciplinas" subtitle="Gerencie as disciplinas e cursos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Disciplinas" subtitle="Gerencie as disciplinas e cursos">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {subjects.length} disciplinas
            </Badge>
          </div>
          <Button className="gap-2" onClick={handleOpenDialog}>
            <Plus className="w-4 h-4" />
            Nova Disciplina
          </Button>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map((subject, index) => (
            <Card
              key={subject.id}
              className="group hover:shadow-md transition-all duration-200 animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`h-2 ${subject.color || "bg-chart-1"}`} />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-heading">{subject.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{subject.code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(subject)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(subject)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{subject.teacher || "Sem professor"}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{subject.classesCount || 0} turmas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{subject.workload_hours || 0}h/semana</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog para Nova/Editar Disciplina */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSubject ? "Editar Disciplina" : "Cadastrar Nova Disciplina"}</DialogTitle>
              <DialogDescription>
                {editingSubject 
                  ? "Atualize os dados da disciplina abaixo."
                  : "Preencha os dados abaixo para cadastrar uma nova disciplina no sistema."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Disciplina *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Matemática"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    placeholder="Será gerado automaticamente se vazio"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para gerar automaticamente
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher">Professor (opcional)</Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Selecione o professor (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum (associar depois)</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Você pode associar um professor depois, se necessário
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Horas por Semana *</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    placeholder="Ex: 4"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Cor</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    editingSubject ? "Atualizar" : "Cadastrar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a disciplina <strong>{deletingSubject?.name}</strong>? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingSubject(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Disciplinas;
