import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { teachersService, type TeacherWithSubjects } from "@/lib/supabase/teachers";
import { subjectsService } from "@/lib/supabase/subjects";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  qualification: string;
  status: "active" | "inactive";
  phone: string;
}

const statusConfig = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  inactive: { label: "Inativo", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Professores = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<TeacherWithSubjects | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    subjects: [] as string[],
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersData, subjectsData] = await Promise.all([
        teachersService.getAll(),
        subjectsService.getAll(),
      ]);

      // Transformar dados do Supabase para o formato da interface
      const formattedTeachers: Teacher[] = teachersData.map((teacher) => ({
        id: teacher.id,
        name: teacher.full_name,
        email: teacher.email,
        phone: teacher.phone || "",
        qualification: teacher.qualification || "",
        status: (teacher.status === "active" ? "active" : "inactive") as "active" | "inactive",
        subjects: teacher.subjects?.map(s => s.subject.name) || [],
      }));

      setTeachers(formattedTeachers);
      setAvailableSubjects(subjectsData.map(s => ({ id: s.id, name: s.name })));
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingTeacher(null);
    setIsDialogOpen(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      qualification: "",
      subjects: [],
      status: "active",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      qualification: "",
      subjects: [],
      status: "active",
    });
  };

  const handleViewDetails = async (teacher: Teacher) => {
    try {
      const teacherData = await teachersService.getById(teacher.id);
      setViewingTeacher(teacherData);
      setIsDetailsDialogOpen(true);
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes: " + error.message);
    }
  };

  const handleEdit = async (teacher: Teacher) => {
    try {
      const teacherData = await teachersService.getById(teacher.id);
      if (teacherData) {
        setEditingTeacher({
          id: teacherData.id,
          name: teacherData.full_name,
          email: teacherData.email,
          phone: teacherData.phone || "",
          qualification: teacherData.qualification || "",
          status: (teacherData.status === "active" ? "active" : "inactive") as "active" | "inactive",
          subjects: teacherData.subjects?.map(s => s.subject.name) || [],
        });
        setFormData({
          name: teacherData.full_name,
          email: teacherData.email,
          phone: teacherData.phone || "",
          qualification: teacherData.qualification || "",
          subjects: teacherData.subjects?.map(s => s.subject.id) || [],
          status: (teacherData.status === "active" ? "active" : "inactive") as "active" | "inactive",
        });
        setIsDialogOpen(true);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar dados do professor: " + error.message);
    }
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setDeletingTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeacher) return;

    try {
      await teachersService.delete(deletingTeacher.id);
      toast.success("Professor excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setDeletingTeacher(null);
      loadData();
    } catch (error: any) {
      toast.error("Erro ao excluir professor: " + error.message);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter((s) => s !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.qualification) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingTeacher) {
        // Atualizar professor
        await teachersService.update(
          editingTeacher.id,
          {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            qualification: formData.qualification,
            status: formData.status,
          },
          formData.subjects
        );

        toast.success("Professor atualizado com sucesso!");
      } else {
        // Criar professor
        await teachersService.create(
          {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            qualification: formData.qualification,
            status: formData.status,
          },
          formData.subjects
        );

        toast.success("Professor cadastrado com sucesso!");
      }

      handleCloseDialog();
      await loadData();
    } catch (error: any) {
      console.error("Erro ao salvar professor:", error);
      const errorMessage = error?.message || error?.error?.message || "Erro desconhecido";
      toast.error((editingTeacher ? "Erro ao atualizar professor: " : "Erro ao cadastrar professor: ") + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
  {
    key: "name",
    header: "Professor",
    render: (teacher: Teacher) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-info/10 text-info text-sm">
            {teacher.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{teacher.name}</p>
          <p className="text-xs text-muted-foreground">{teacher.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "subjects",
    header: "Disciplinas",
    render: (teacher: Teacher) => (
      <div className="flex flex-wrap gap-1">
        {teacher.subjects.length > 0 ? (
          teacher.subjects.map((subject) => (
            <Badge key={subject} variant="secondary" className="text-xs">
              {subject}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Sem disciplinas</span>
        )}
      </div>
    ),
  },
  {
    key: "qualification",
    header: "Formação",
    render: (teacher: Teacher) => (
      <span className="text-sm text-muted-foreground">{teacher.qualification || "—"}</span>
    ),
  },
  {
    key: "phone",
    header: "Telefone",
  },
  {
    key: "status",
    header: "Status",
    render: (teacher: Teacher) => (
      <Badge variant="outline" className={statusConfig[teacher.status].className}>
        {statusConfig[teacher.status].label}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "w-12",
    render: (teacher: Teacher) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewDetails(teacher)}>
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(teacher)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => handleDeleteClick(teacher)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];


  if (loading) {
    return (
      <MainLayout title="Professores" subtitle="Gerencie o corpo docente">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Professores" subtitle="Gerencie o corpo docente">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {teachers.length} professores
            </Badge>
            <Badge variant="outline" className="font-normal bg-success/10 text-success border-success/20">
              {teachers.filter((t) => t.status === "active").length} ativos
            </Badge>
          </div>
          <Button className="gap-2" onClick={handleOpenDialog}>
            <Plus className="w-4 h-4" />
            Novo Professor
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={teachers}
          columns={columns}
          searchPlaceholder="Buscar professor por nome..."
          searchKey="name"
        />

        {/* Dialog para Ver Detalhes */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Professor</DialogTitle>
            </DialogHeader>
            {viewingTeacher && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Nome Completo</Label>
                  <p className="font-medium">{viewingTeacher.full_name}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{viewingTeacher.email}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p>{viewingTeacher.phone || "Não informado"}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Formação</Label>
                  <p>{viewingTeacher.qualification || "Não informado"}</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Disciplinas</Label>
                  <div className="flex flex-wrap gap-1">
                    {viewingTeacher.subjects && viewingTeacher.subjects.length > 0 ? (
                      viewingTeacher.subjects.map((subj) => (
                        <Badge key={subj.id} variant="secondary">
                          {subj.subject.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem disciplinas associadas</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant="outline" className={statusConfig[viewingTeacher.status === "active" ? "active" : "inactive"].className}>
                    {statusConfig[viewingTeacher.status === "active" ? "active" : "inactive"].label}
                  </Badge>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Novo/Editar Professor */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? "Editar Professor" : "Cadastrar Novo Professor"}</DialogTitle>
              <DialogDescription>
                {editingTeacher 
                  ? "Atualize os dados do professor abaixo."
                  : "Preencha os dados abaixo para cadastrar um novo professor no sistema."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo do professor"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@escola.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qualification">Formação *</Label>
                  <Input
                    id="qualification"
                    placeholder="Ex: Mestrado em Matemática"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Disciplinas (opcional)</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                    {availableSubjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma disciplina cadastrada. Você pode cadastrar o professor agora e associar disciplinas depois.
                      </p>
                    ) : (
                      availableSubjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={formData.subjects.includes(subject.id)}
                            onCheckedChange={() => handleSubjectToggle(subject.id)}
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor={`subject-${subject.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {subject.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  {formData.subjects.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.subjects.length} disciplina(s) selecionada(s)
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") =>
                      setFormData({ ...formData, status: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
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
                    editingTeacher ? "Atualizar" : "Cadastrar"
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
                Tem certeza que deseja excluir o professor <strong>{deletingTeacher?.name}</strong>? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingTeacher(null)}>
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

export default Professores;
