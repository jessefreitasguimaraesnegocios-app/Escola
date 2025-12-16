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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Validação básica
    if (!formData.name || !formData.code || !formData.teacherId || !formData.hours) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Criar disciplina
      const newSubject = await subjectsService.create({
        name: formData.name,
        code: formData.code || generateCode(formData.name),
        workload_hours: parseInt(formData.hours),
        color: formData.color,
      });

      // Associar professor à disciplina
      if (formData.teacherId) {
        await supabase
          .from('teacher_subjects')
          .insert({
            teacher_id: formData.teacherId,
            subject_id: newSubject.id,
          });
      }

      toast.success("Disciplina cadastrada com sucesso!");
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error("Erro ao cadastrar disciplina: " + error.message);
      console.error(error);
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
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
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

        {/* Dialog para Nova Disciplina */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Disciplina</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar uma nova disciplina no sistema.
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
                  <Label htmlFor="teacher">Professor *</Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

export default Disciplinas;
