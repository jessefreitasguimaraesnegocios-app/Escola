import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];
type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

export interface ScheduleWithDetails extends Schedule {
  subject?: {
    id: string;
    name: string;
    code: string;
    color?: string | null;
  };
  teacher?: {
    id: string;
    full_name: string;
  } | null;
  class?: {
    id: string;
    name: string;
  };
}

// Mapeamento de nomes de dias para números (segunda = 0, terça = 1, etc)
const dayNameToNumber: Record<string, number> = {
  "Segunda": 0,
  "Terça": 1,
  "Quarta": 2,
  "Quinta": 3,
  "Sexta": 4,
};

export const schedulesService = {
  async getByClass(classId: string): Promise<ScheduleWithDetails[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        subject:subjects!inner (
          id,
          name,
          code,
          color
        ),
        teacher:teachers (
          id,
          full_name
        ),
        class:classes!inner (
          id,
          name
        )
      `)
      .eq('class_id', classId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []) as ScheduleWithDetails[];
  },

  async create(schedule: ScheduleInsert): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createMany(schedules: ScheduleInsert[]): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedules)
      .select();

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: ScheduleUpdate): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByClass(classId: string): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('class_id', classId);

    if (error) throw error;
  },

  // Função para gerar horários automaticamente
  async generateAutomaticSchedule(
    classId: string,
    timeSlots: Array<{ start: string; end: string }>,
    days: string[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
  ): Promise<Schedule[]> {
    // 1. Buscar disciplinas e professores associados à turma
    const { data: teacherSubjects, error: tsError } = await supabase
      .from('teacher_subjects')
      .select(`
        teacher_id,
        subject_id,
        subject:subjects!inner (
          id,
          name,
          code,
          color,
          workload_hours
        ),
        teacher:teachers!inner (
          id,
          full_name
        )
      `)
      .eq('class_id', classId);

    if (tsError) throw tsError;

    if (!teacherSubjects || teacherSubjects.length === 0) {
      throw new Error('Nenhuma disciplina encontrada para esta turma. Associe disciplinas e professores à turma primeiro.');
    }

    // 2. Buscar informações da turma para obter a sala
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('room')
      .eq('id', classId)
      .single();

    if (classError) throw classError;

    // 3. Remover horários existentes da turma
    await this.deleteByClass(classId);

    // 4. Preparar dados para geração
    const schedules: ScheduleInsert[] = [];
    
    // Criar um mapa de horários ocupados por professor (para evitar conflitos)
    const teacherOccupiedSlots: Record<string, Set<string>> = {};
    
    // Para cada disciplina, calcular quantos períodos precisamos
    // Assumindo que cada período tem 50 minutos (ajuste conforme necessário)
    const subjectsToSchedule: Array<{ teacherId: string; subjectId: string; periods: number }> = [];
    
    teacherSubjects.forEach((ts: any) => {
      const workloadHours = ts.subject.workload_hours || 60;
      // Assumindo que cada período tem 50 minutos, calcular períodos necessários
      const periodsNeeded = Math.ceil(workloadHours / 50);
      // Limitar ao máximo disponível, mas garantir pelo menos 2 períodos por disciplina
      const periods = Math.max(2, Math.min(periodsNeeded, timeSlots.length * days.length));
      
      subjectsToSchedule.push({
        teacherId: ts.teacher_id,
        subjectId: ts.subject.id,
        periods: periods,
      });
      
      // Inicializar o conjunto de slots ocupados para o professor
      if (!teacherOccupiedSlots[ts.teacher_id]) {
        teacherOccupiedSlots[ts.teacher_id] = new Set();
      }
    });

    // 5. Criar lista de todos os slots disponíveis
    const allSlots: Array<{ day: number; dayIdx: number; slotIdx: number; timeSlot: { start: string; end: string } }> = [];
    
    for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
      for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
        allSlots.push({
          day: dayNameToNumber[days[dayIdx]],
          dayIdx,
          slotIdx,
          timeSlot: timeSlots[slotIdx],
        });
      }
    }

    // 6. Distribuir disciplinas de forma balanceada usando round-robin
    // Criar lista de períodos pendentes por disciplina
    const pendingPeriods: Array<{ teacherId: string; subjectId: string; remaining: number }> = [];
    subjectsToSchedule.forEach(sub => {
      for (let i = 0; i < sub.periods; i++) {
        pendingPeriods.push({
          teacherId: sub.teacherId,
          subjectId: sub.subjectId,
          remaining: 1,
        });
      }
    });

    // Embaralhar a lista para distribuição aleatória balanceada
    for (let i = pendingPeriods.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pendingPeriods[i], pendingPeriods[j]] = [pendingPeriods[j], pendingPeriods[i]];
    }

    // Tentar alocar cada período
    const usedSlots = new Set<string>();
    
    for (const period of pendingPeriods) {
      let allocated = false;
      
      // Tentar encontrar um slot disponível
      for (let i = 0; i < allSlots.length; i++) {
        const slot = allSlots[i];
        const slotKey = `${slot.day}-${slot.timeSlot.start}-${slot.timeSlot.end}`;
        const teacherSlotKey = `${period.teacherId}-${slotKey}`;
        
        // Verificar se o slot não está ocupado e o professor está livre
        if (!usedSlots.has(slotKey) && !teacherOccupiedSlots[period.teacherId].has(slotKey)) {
          schedules.push({
            class_id: classId,
            subject_id: period.subjectId,
            teacher_id: period.teacherId,
            day_of_week: slot.day,
            start_time: slot.timeSlot.start,
            end_time: slot.timeSlot.end,
            room: classData.room || null,
          });
          
          usedSlots.add(slotKey);
          teacherOccupiedSlots[period.teacherId].add(slotKey);
          allocated = true;
          break;
        }
      }
      
      // Se não conseguiu alocar, o período não será incluído (não há slots disponíveis)
    }

    // 7. Salvar no banco de dados
    if (schedules.length > 0) {
      return await this.createMany(schedules);
    }

    return [];
  },
};

