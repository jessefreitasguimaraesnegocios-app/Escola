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
import { useState, useEffect } from "react";

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

// Notificações iniciais
const initialNotifications: Notification[] = [
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
];

// Estado persistente fora do componente para manter entre remontagens
// Inicializa como null para detectar primeira inicialização
const persistedNotifications: { value: Notification[] | null } = { value: null };

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();

  // Estado para notificações - usa valor persistido se existir, senão inicia com valores padrão apenas na primeira vez
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Se já existe valor persistido (mesmo que seja array vazio), usa ele
    if (persistedNotifications.value !== null) {
      return persistedNotifications.value;
    }
    // Primeira inicialização: usa valores iniciais
    const initial = [...initialNotifications];
    persistedNotifications.value = initial;
    return initial;
  });

  // Sincronizar estado persistente quando o estado muda
  useEffect(() => {
    persistedNotifications.value = notifications;
  }, [notifications]);

  // Estado para controlar se o dropdown de notificações está aberto
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
    // Remover a notificação da lista imediatamente
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notification.id);
      persistedNotifications.value = updated;
      return updated;
    });

    // Fechar o dropdown após um pequeno delay para melhor UX
    setTimeout(() => {
      setIsNotificationsOpen(false);
    }, 150);

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
        <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notificationCount > 0 ? (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {notificationCount}
                </Badge>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              {notificationCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem disabled className="text-center py-6 text-muted-foreground">
                <div className="flex flex-col items-center gap-2 w-full">
                  <Bell className="h-8 w-8 text-muted-foreground/50" />
                  <span>Nenhuma notificação</span>
                </div>
              </DropdownMenuItem>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 py-3 cursor-pointer hover:bg-accent transition-colors"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }}
                  >
                    <span className="font-semibold text-sm">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                  </DropdownMenuItem>
                ))}
              </div>
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
