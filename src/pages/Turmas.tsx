import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Users, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { classesService, type ClassWithTeacher } from "@/lib/supabase/classes";
import { teachersService } from "@/lib/supabase/teachers";

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

const availableLevels = ["Fundamental II", "Ensino Médio"];
const availableShifts = ["Manhã", "Tarde", "Noite"];

const shiftConfig: Record<string, string> = {
  "Manhã": "bg-warning/10 text-warning border-warning/20",
  "Tarde": "bg-info/10 text-info border-info/20",
  "Noite": "bg-primary/10 text-primary border-primary/20",
  "morning": "bg-warning/10 text-warning border-warning/20",
  "afternoon": "bg-info/10 text-info border-info/20",
  "night": "bg-primary/10 text-primary border-primary/20",
};

const columns = [
  {
    key: "name",
    header: "Turma",
    render: (cls: Class) => (
      <div>
        <p className="font-medium text-foreground">{cls.name}</p>
        <p className="text-xs text-muted-foreground">{cls.level || "—"}</p>
      </div>
    ),
  },
  {
    key: "shift",
    header: "Turno",
    render: (cls: Class) => {
      const shiftDisplay = cls.shift === "morning" ? "Manhã" : 
                          cls.shift === "afternoon" ? "Tarde" :
                          cls.shift === "night" ? "Noite" : cls.shift;
      const className = shiftConfig[shiftDisplay] || shiftConfig[cls.shift] || "bg-muted/10 text-muted border-muted/20";
      return (
        <Badge variant="outline" className={className}>
          {shiftDisplay}
        </Badge>
      );
    },
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
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    shift: "",
    capacity: "",
    teacherId: "",
    room: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, teachersData] = await Promise.all([
        classesService.getAll(),
        teachersService.getAll(),
      ]);

      // Transformar dados do Supabase para o formato da interface
      const formattedClasses: Class[] = classesData.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level || "",
        shift: cls.shift === "morning" ? "Manhã" : 
               cls.shift === "afternoon" ? "Tarde" :
               cls.shift === "night" ? "Noite" : cls.shift,
        capacity: cls.max_capacity || 40,
        enrolled: cls.enrolled_count || 0,
        teacher: cls.teacher?.full_name || "Sem professor",
        room: cls.room || "—",
      }));

      setClasses(formattedClasses);
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
      level: "",
      shift: "",
      capacity: "",
      teacherId: "",
      room: "",
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const mapShiftToDB = (shift: string): string => {
    if (shift === "Manhã") return "morning";
    if (shift === "Tarde") return "afternoon";
    if (shift === "Noite") return "night";
    return shift;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.level || !formData.shift || !formData.capacity || !formData.teacherId || !formData.room) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Extrair ano do nome da turma ou usar ano atual
      const currentYear = new Date().getFullYear();

      await classesService.create({
        name: formData.name,
        year: currentYear,
        level: formData.level,
        shift: mapShiftToDB(formData.shift),
        max_capacity: parseInt(formData.capacity),
        teacher_id: formData.teacherId || null,
        room: formData.room,
      });

      toast.success("Turma cadastrada com sucesso!");
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error("Erro ao cadastrar turma: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Turmas" subtitle="Gerencie as turmas e seções">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="level">Nível *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
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

export default Turmas;
