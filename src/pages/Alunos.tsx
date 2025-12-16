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
import { toast } from "sonner";
import { studentsService, type StudentWithClass } from "@/lib/supabase/students";
import { classesService } from "@/lib/supabase/classes";
import type { Database } from "@/integrations/supabase/types";

type StudentStatus = Database['public']['Enums']['student_status'];

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  status: StudentStatus;
  enrollment: string;
  phone: string;
}

const statusConfig = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  inactive: { label: "Inativo", className: "bg-destructive/10 text-destructive border-destructive/20" },
  graduated: { label: "Formado", className: "bg-info/10 text-info border-info/20" },
  transferred: { label: "Transferido", className: "bg-warning/10 text-warning border-warning/20" },
};

const columns = [
  {
    key: "name",
    header: "Aluno",
    render: (student: Student) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{student.name}</p>
          <p className="text-xs text-muted-foreground">{student.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "enrollment",
    header: "Matrícula",
    render: (student: Student) => (
      <span className="font-mono text-sm">{student.enrollment}</span>
    ),
  },
  {
    key: "class",
    header: "Turma",
  },
  {
    key: "phone",
    header: "Telefone",
  },
  {
    key: "status",
    header: "Status",
    render: (student: Student) => (
      <Badge variant="outline" className={statusConfig[student.status || 'active'].className}>
        {statusConfig[student.status || 'active'].label}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "w-12",
    render: (student: Student) => (
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

const Alunos = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classId: "",
    status: "active" as StudentStatus,
    phone: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        studentsService.getAll(),
        classesService.getAll(),
      ]);

      // Transformar dados do Supabase para o formato da interface
      const formattedStudents: Student[] = studentsData.map((student) => ({
        id: student.id,
        name: student.full_name,
        email: student.email || "",
        class: student.classes?.name || "Sem turma",
        status: student.status || "active",
        enrollment: student.registration_number,
        phone: student.phone || "",
      }));

      setStudents(formattedStudents);
      setClasses(classesData.map(cls => ({ id: cls.id, name: cls.name })));
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
      classId: "",
      status: "active",
      phone: "",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.classId || !formData.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Gerar número de matrícula (ano atual + sequencial)
      const year = new Date().getFullYear();
      const existingStudents = await studentsService.getAll();
      const yearStudents = existingStudents.filter(s => 
        s.registration_number.startsWith(year.toString())
      );
      const nextNumber = yearStudents.length > 0
        ? Math.max(...yearStudents.map(s => parseInt(s.registration_number.slice(-4)))) + 1
        : 1;
      const registrationNumber = `${year}${String(nextNumber).padStart(4, '0')}`;

      // Criar aluno
      await studentsService.create({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        registration_number: registrationNumber,
        status: formData.status,
        class_id: formData.classId || null,
      });

      toast.success("Aluno cadastrado com sucesso!");
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error("Erro ao cadastrar aluno: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Alunos" subtitle="Gerencie os alunos matriculados">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Alunos" subtitle="Gerencie os alunos matriculados">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {students.length} alunos
            </Badge>
            <Badge variant="outline" className="font-normal bg-success/10 text-success border-success/20">
              {students.filter((s) => s.status === "active").length} ativos
            </Badge>
          </div>
          <Button className="gap-2" onClick={handleOpenDialog}>
            <Plus className="w-4 h-4" />
            Novo Aluno
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={students}
          columns={columns}
          searchPlaceholder="Buscar aluno por nome..."
          searchKey="name"
        />

        {/* Dialog para Novo Aluno */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo aluno no sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo do aluno"
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
                    placeholder="email@exemplo.com"
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
                  <Label htmlFor="class">Turma *</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: StudentStatus) =>
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
                      <SelectItem value="graduated">Formado</SelectItem>
                      <SelectItem value="transferred">Transferido</SelectItem>
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

export default Alunos;
