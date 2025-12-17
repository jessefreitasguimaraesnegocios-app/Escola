import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'enrollment' | 'grade' | 'calendar';
  actionPath?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();

  // Estado para notificações
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova matrícula pendente',
      message: 'João Silva aguarda aprovação',
      type: 'enrollment',
      actionPath: '/alunos'
    },
    {
      id: '2',
      title: 'Notas lançadas',
      message: 'Prof. Maria lançou notas de Matemática',
      type: 'grade',
      actionPath: '/notas'
    },
    {
      id: '3',
      title: 'Reunião agendada',
      message: 'Conselho de classe - 15/01',
      type: 'calendar',
      actionPath: '/calendario'
    }
  ]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/auth");
  };

  const getUserInitials = () => {
    if (!user?.email) return "??";
    return user.email.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('teacher')) return 'Professor';
    if (roles.includes('student')) return 'Aluno';
    if (roles.includes('parent')) return 'Responsável';
    return 'Usuário';
  };

  const notificationCount = notifications.length;

  const handleNotificationClick = (notification: Notification) => {
    // Remover a notificação da lista
    setNotifications(prev => 
      prev.filter(n => n.id !== notification.id)
    );

    // Navegar para a página relacionada
    if (notification.actionPath) {
      navigate(notification.actionPath);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem disabled className="text-center py-6 text-muted-foreground">
                Nenhuma notificação
              </DropdownMenuItem>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer bg-accent"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="font-semibold">
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{notification.message}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">{getRoleLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Minha Conta</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracoes')}>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
