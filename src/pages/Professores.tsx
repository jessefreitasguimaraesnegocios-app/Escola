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
import { Checkbox } from "@/components/ui/checkbox";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  qualification: string;
  status: "active" | "inactive";
  phone: string;
}

const initialTeachers: Teacher[] = [
  { id: "1", name: "Maria Santos", email: "maria.santos@escola.com", subjects: ["Matemática", "Física"], qualification: "Mestrado em Matemática", status: "active", phone: "(11) 98888-1234" },
  { id: "2", name: "Carlos Oliveira", email: "carlos.oliveira@escola.com", subjects: ["Física", "Química"], qualification: "Doutorado em Física", status: "active", phone: "(11) 98888-2345" },
  { id: "3", name: "Ana Paula Ferreira", email: "ana.ferreira@escola.com", subjects: ["Português", "Literatura"], qualification: "Especialização em Letras", status: "active", phone: "(11) 98888-3456" },
  { id: "4", name: "Roberto Lima", email: "roberto.lima@escola.com", subjects: ["História", "Geografia"], qualification: "Mestrado em História", status: "active", phone: "(11) 98888-4567" },
  { id: "5", name: "Fernanda Costa", email: "fernanda.costa@escola.com", subjects: ["Biologia", "Ciências"], qualification: "Mestrado em Biologia", status: "active", phone: "(11) 98888-5678" },
  { id: "6", name: "Pedro Almeida", email: "pedro.almeida@escola.com", subjects: ["Educação Física"], qualification: "Licenciatura em Ed. Física", status: "inactive", phone: "(11) 98888-6789" },
];

const availableSubjects = [
  "Matemática",
  "Português",
  "Física",
  "Química",
  "História",
  "Geografia",
  "Biologia",
  "Ciências",
  "Literatura",
  "Educação Física",
];

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
        {teacher.subjects.map((subject) => (
          <Badge key={subject} variant="secondary" className="text-xs">
            {subject}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "qualification",
    header: "Formação",
    render: (teacher: Teacher) => (
      <span className="text-sm text-muted-foreground">{teacher.qualification}</span>
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
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    subjects: [] as string[],
    status: "active" as "active" | "inactive",
  });

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

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.qualification || formData.subjects.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios e selecione pelo menos uma disciplina.");
      return;
    }

    // Criar novo professor
    const newTeacher: Teacher = {
      id: String(teachers.length + 1),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      qualification: formData.qualification,
      subjects: formData.subjects,
      status: formData.status,
    };

    // Adicionar à lista
    setTeachers([...teachers, newTeacher]);

    // Fechar diálogo e limpar formulário
    handleCloseDialog();
  };

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
                  <Label htmlFor="qualification">Formação *</Label>
                  <Input
                    id="qualification"
                    placeholder="Ex: Mestrado em Matemática"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Disciplinas *</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                    {availableSubjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${subject}`}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={() => handleSubjectToggle(subject)}
                        />
                        <Label
                          htmlFor={`subject-${subject}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {subject}
                        </Label>
                      </div>
                    ))}
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

export default Professores;
