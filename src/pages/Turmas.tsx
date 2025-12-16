import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
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

interface Class {
  id: string;
  name: string;
  level: string;
  shift: string;
  capacity: number;
  enrolled: number;
  teacher: string;
  room: string;
}

const initialClasses: Class[] = [
  { id: "1", name: "7º Ano A", level: "Fundamental II", shift: "Manhã", capacity: 35, enrolled: 32, teacher: "Maria Santos", room: "Sala 101" },
  { id: "2", name: "7º Ano B", level: "Fundamental II", shift: "Manhã", capacity: 35, enrolled: 30, teacher: "Carlos Oliveira", room: "Sala 102" },
  { id: "3", name: "8º Ano A", level: "Fundamental II", shift: "Manhã", capacity: 35, enrolled: 35, teacher: "Ana Paula Ferreira", room: "Sala 103" },
  { id: "4", name: "8º Ano B", level: "Fundamental II", shift: "Tarde", capacity: 35, enrolled: 28, teacher: "Roberto Lima", room: "Sala 104" },
  { id: "5", name: "9º Ano A", level: "Fundamental II", shift: "Manhã", capacity: 35, enrolled: 33, teacher: "Fernanda Costa", room: "Sala 105" },
  { id: "6", name: "9º Ano B", level: "Fundamental II", shift: "Tarde", capacity: 35, enrolled: 31, teacher: "Maria Santos", room: "Sala 106" },
  { id: "7", name: "1º Ano EM", level: "Ensino Médio", shift: "Manhã", capacity: 40, enrolled: 38, teacher: "Carlos Oliveira", room: "Sala 201" },
  { id: "8", name: "2º Ano EM", level: "Ensino Médio", shift: "Manhã", capacity: 40, enrolled: 36, teacher: "Ana Paula Ferreira", room: "Sala 202" },
];

const availableTeachers = [
  "Maria Santos",
  "Carlos Oliveira",
  "Ana Paula Ferreira",
  "Roberto Lima",
  "Fernanda Costa",
  "Pedro Almeida",
];

const availableLevels = ["Fundamental II", "Ensino Médio"];
const availableShifts = ["Manhã", "Tarde", "Noite"];

const shiftConfig = {
  "Manhã": "bg-warning/10 text-warning border-warning/20",
  "Tarde": "bg-info/10 text-info border-info/20",
  "Noite": "bg-primary/10 text-primary border-primary/20",
};

const columns = [
  {
    key: "name",
    header: "Turma",
    render: (cls: Class) => (
      <div>
        <p className="font-medium text-foreground">{cls.name}</p>
        <p className="text-xs text-muted-foreground">{cls.level}</p>
      </div>
    ),
  },
  {
    key: "shift",
    header: "Turno",
    render: (cls: Class) => (
      <Badge variant="outline" className={shiftConfig[cls.shift as keyof typeof shiftConfig]}>
        {cls.shift}
      </Badge>
    ),
  },
  {
    key: "teacher",
    header: "Professor Responsável",
  },
  {
    key: "room",
    header: "Sala",
  },
  {
    key: "capacity",
    header: "Ocupação",
    render: (cls: Class) => {
      const percentage = Math.round((cls.enrolled / cls.capacity) * 100);
      return (
        <div className="space-y-1 min-w-[120px]">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {cls.enrolled}/{cls.capacity}
            </span>
            <span className="text-muted-foreground">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-1.5" />
        </div>
      );
    },
  },
  {
    key: "actions",
    header: "",
    className: "w-12",
    render: (cls: Class) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="w-4 h-4 mr-2" />
            Ver Alunos
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

const Turmas = () => {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    shift: "",
    capacity: "",
    teacher: "",
    room: "",
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setFormData({
      name: "",
      level: "",
      shift: "",
      capacity: "",
      teacher: "",
      room: "",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.level || !formData.shift || !formData.capacity || !formData.teacher || !formData.room) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Criar nova turma
    const newClass: Class = {
      id: String(classes.length + 1),
      name: formData.name,
      level: formData.level,
      shift: formData.shift,
      capacity: parseInt(formData.capacity),
      enrolled: 0, // Nova turma começa sem alunos matriculados
      teacher: formData.teacher,
      room: formData.room,
    };

    // Adicionar à lista
    setClasses([...classes, newClass]);

    // Fechar diálogo e limpar formulário
    handleCloseDialog();
  };

  return (
    <MainLayout title="Turmas" subtitle="Gerencie as turmas e seções">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {classes.length} turmas
            </Badge>
            <Badge variant="outline" className="font-normal">
              {classes.reduce((acc, c) => acc + c.enrolled, 0)} alunos matriculados
            </Badge>
          </div>
          <Button className="gap-2" onClick={handleOpenDialog}>
            <Plus className="w-4 h-4" />
            Nova Turma
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={classes}
          columns={columns}
          searchPlaceholder="Buscar turma..."
          searchKey="name"
        />

        {/* Dialog para Nova Turma */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Turma</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar uma nova turma no sistema.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Turma *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: 7º Ano A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="level">Nível *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="shift">Turno *</Label>
                    <Select
                      value={formData.shift}
                      onValueChange={(value) => setFormData({ ...formData, shift: value })}
                    >
                      <SelectTrigger id="shift">
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableShifts.map((shift) => (
                          <SelectItem key={shift} value={shift}>
                            {shift}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacher">Professor Responsável *</Label>
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
                    <Label htmlFor="capacity">Capacidade *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      placeholder="Ex: 35"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="room">Sala *</Label>
                    <Input
                      id="room"
                      placeholder="Ex: Sala 101"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      required
                    />
                  </div>
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

export default Turmas;
