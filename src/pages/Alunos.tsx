import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  status: "active" | "inactive" | "graduated";
  enrollment: string;
  phone: string;
}

const initialStudents: Student[] = [
  { id: "1", name: "Ana Silva Santos", email: "ana.silva@email.com", class: "9º Ano A", status: "active", enrollment: "2024001", phone: "(11) 99999-1234" },
  { id: "2", name: "Bruno Costa Oliveira", email: "bruno.costa@email.com", class: "9º Ano A", status: "active", enrollment: "2024002", phone: "(11) 99999-2345" },
  { id: "3", name: "Carla Mendes Lima", email: "carla.mendes@email.com", class: "8º Ano B", status: "active", enrollment: "2024003", phone: "(11) 99999-3456" },
  { id: "4", name: "Daniel Ferreira Souza", email: "daniel.ferreira@email.com", class: "9º Ano B", status: "inactive", enrollment: "2024004", phone: "(11) 99999-4567" },
  { id: "5", name: "Elena Rodrigues Alves", email: "elena.rodrigues@email.com", class: "7º Ano A", status: "active", enrollment: "2024005", phone: "(11) 99999-5678" },
  { id: "6", name: "Felipe Martins Pereira", email: "felipe.martins@email.com", class: "8º Ano A", status: "active", enrollment: "2024006", phone: "(11) 99999-6789" },
  { id: "7", name: "Gabriela Santos Costa", email: "gabriela.santos@email.com", class: "9º Ano A", status: "graduated", enrollment: "2023001", phone: "(11) 99999-7890" },
  { id: "8", name: "Hugo Almeida Silva", email: "hugo.almeida@email.com", class: "7º Ano B", status: "active", enrollment: "2024007", phone: "(11) 99999-8901" },
];

const turmas = ["7º Ano A", "7º Ano B", "8º Ano A", "8º Ano B", "9º Ano A", "9º Ano B"];

const statusConfig = {
  active: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  inactive: { label: "Inativo", className: "bg-destructive/10 text-destructive border-destructive/20" },
  graduated: { label: "Formado", className: "bg-info/10 text-info border-info/20" },
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
      <Badge variant="outline" className={statusConfig[student.status].className}>
        {statusConfig[student.status].label}
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
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    class: "",
    status: "active" as "active" | "inactive" | "graduated",
    phone: "",
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setFormData({
      name: "",
      email: "",
      class: "",
      status: "active",
      phone: "",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.email || !formData.class || !formData.phone) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Gerar nova matrícula (maior matrícula + 1)
    const enrollments = students.map(s => parseInt(s.enrollment));
    const maxEnrollment = enrollments.length > 0 ? Math.max(...enrollments) : 2024000;
    const newEnrollment = String(maxEnrollment + 1);

    // Criar novo aluno
    const newStudent: Student = {
      id: String(students.length + 1),
      name: formData.name,
      email: formData.email,
      class: formData.class,
      status: formData.status,
      enrollment: newEnrollment,
      phone: formData.phone,
    };

    // Adicionar à lista
    setStudents([...students, newStudent]);
    
    // Fechar diálogo e limpar formulário
    handleCloseDialog();
  };

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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="class">Turma *</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) => setFormData({ ...formData, class: value })}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((turma) => (
                        <SelectItem key={turma} value={turma}>
                          {turma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive" | "graduated") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="graduated">Formado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Alunos;
