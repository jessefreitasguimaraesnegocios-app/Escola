import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Users, Clock, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  classes: number;
  hours: number;
  color: string;
}

const initialSubjects: Subject[] = [
  { id: "1", name: "Matemática", code: "MAT001", teacher: "Maria Santos", classes: 8, hours: 4, color: "bg-chart-1" },
  { id: "2", name: "Português", code: "POR001", teacher: "Ana Paula Ferreira", classes: 8, hours: 4, color: "bg-chart-2" },
  { id: "3", name: "Física", code: "FIS001", teacher: "Carlos Oliveira", classes: 6, hours: 3, color: "bg-chart-3" },
  { id: "4", name: "Química", code: "QUI001", teacher: "Carlos Oliveira", classes: 6, hours: 3, color: "bg-chart-4" },
  { id: "5", name: "História", code: "HIS001", teacher: "Roberto Lima", classes: 8, hours: 2, color: "bg-chart-5" },
  { id: "6", name: "Geografia", code: "GEO001", teacher: "Roberto Lima", classes: 8, hours: 2, color: "bg-chart-1" },
  { id: "7", name: "Biologia", code: "BIO001", teacher: "Fernanda Costa", classes: 6, hours: 3, color: "bg-chart-2" },
  { id: "8", name: "Educação Física", code: "EDF001", teacher: "Pedro Almeida", classes: 8, hours: 2, color: "bg-chart-3" },
];

const availableTeachers = [
  "Maria Santos",
  "Carlos Oliveira",
  "Ana Paula Ferreira",
  "Roberto Lima",
  "Fernanda Costa",
  "Pedro Almeida",
];

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
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacher: "",
    classes: "",
    hours: "",
    color: "bg-chart-1",
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setFormData({
      name: "",
      code: "",
      teacher: "",
      classes: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.teacher || !formData.classes || !formData.hours) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Criar nova disciplina
    const newSubject: Subject = {
      id: String(subjects.length + 1),
      name: formData.name,
      code: formData.code || generateCode(formData.name),
      teacher: formData.teacher,
      classes: parseInt(formData.classes),
      hours: parseInt(formData.hours),
      color: formData.color,
    };

    // Adicionar à lista
    setSubjects([...subjects, newSubject]);

    // Fechar diálogo e limpar formulário
    handleCloseDialog();
  };

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
              <div className={`h-2 ${subject.color}`} />
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
                <p className="text-sm text-muted-foreground">{subject.teacher}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{subject.classes} turmas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{subject.hours}h/semana</span>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    placeholder="Será gerado automaticamente se vazio"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para gerar automaticamente
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher">Professor *</Label>
                  <Select
                    value={formData.teacher}
                    onValueChange={(value) => setFormData({ ...formData, teacher: value })}
                  >
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="classes">Número de Turmas *</Label>
                    <Input
                      id="classes"
                      type="number"
                      min="1"
                      placeholder="Ex: 8"
                      value={formData.classes}
                      onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                      required
                    />
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
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Cor</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
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

export default Disciplinas;
