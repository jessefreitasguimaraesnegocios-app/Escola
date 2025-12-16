import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Bell, Shield, Database, Users, Save } from "lucide-react";

const Configuracoes = () => {
  // Estado para informações da escola
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "Escola Municipal Professor João Silva",
    cnpj: "12.345.678/0001-90",
    email: "contato@escolajoaosilva.edu.br",
    phone: "(11) 3456-7890",
    address: "Rua das Flores, 123 - Centro - São Paulo, SP",
  });

  // Estado para ano letivo
  const [academicYear, setAcademicYear] = useState({
    year: "2024",
    startDate: "2024-01-29",
    endDate: "2024-12-20",
  });

  const handleSaveSchoolInfo = () => {
    // Aqui você pode adicionar lógica para salvar no backend
    // Por enquanto, apenas mostra uma mensagem de sucesso
    alert("Informações da escola salvas com sucesso!");
    console.log("Dados salvos:", schoolInfo);
  };

  const handleSaveAcademicYear = () => {
    // Aqui você pode adicionar lógica para salvar no backend
    alert("Ano letivo salvo com sucesso!");
    console.log("Ano letivo salvo:", academicYear);
  };

  return (
    <MainLayout title="Configurações" subtitle="Gerencie as configurações do sistema">
      <Tabs defaultValue="escola" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="escola" className="gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Escola</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* School Settings */}
        <TabsContent value="escola" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Escola</CardTitle>
              <CardDescription>Configure as informações básicas da instituição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nome da Escola</Label>
                  <Input
                    id="schoolName"
                    value={schoolInfo.schoolName}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={schoolInfo.cnpj}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, cnpj: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="gap-2" onClick={handleSaveSchoolInfo}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ano Letivo</CardTitle>
              <CardDescription>Configure o período do ano letivo atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    value={academicYear.year}
                    onChange={(e) => setAcademicYear({ ...academicYear, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={academicYear.startDate}
                    onChange={(e) => setAcademicYear({ ...academicYear, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={academicYear.endDate}
                    onChange={(e) => setAcademicYear({ ...academicYear, endDate: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="gap-2" onClick={handleSaveAcademicYear}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações importantes por e-mail</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Matrículas</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando houver novas matrículas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lançamento de Notas</Label>
                  <p className="text-sm text-muted-foreground">Notificar quando notas forem lançadas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Eventos do Calendário</Label>
                  <p className="text-sm text-muted-foreground">Lembrete de eventos próximos</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autenticação em Dois Fatores</CardTitle>
              <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ativar 2FA</Label>
                  <p className="text-sm text-muted-foreground">
                    Use um aplicativo autenticador para login
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Configurações avançadas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">Realizar backup diário dos dados</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">Bloquear acesso durante manutenção</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logs do Sistema</Label>
                  <p className="text-sm text-muted-foreground">Manter registros de atividades</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>Detalhes técnicos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Versão</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Último Backup</p>
                  <p className="font-medium">Hoje, 03:00</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usuários Ativos</p>
                  <p className="font-medium">156</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Espaço Utilizado</p>
                  <p className="font-medium">2.4 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Configuracoes;
