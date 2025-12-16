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
          <DropdownMenuItem>
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </DropdownMenuItem>
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
    ),
  },
];

const Professores = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.qualification || formData.subjects.length === 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios e selecione pelo menos uma disciplina.");
      return;
    }

    try {
      setIsSubmitting(true);

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
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error("Erro ao cadastrar professor: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Dialog para Novo Professor */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Professor</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo professor no sistema.
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
                  <Label>Disciplinas *</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                    {availableSubjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma disciplina cadastrada. Cadastre disciplinas primeiro.
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

export default Professores;
