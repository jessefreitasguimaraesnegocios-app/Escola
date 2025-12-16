import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Class = Database['public']['Tables']['classes']['Row'];
type ClassInsert = Database['public']['Tables']['classes']['Insert'];
type ClassUpdate = Database['public']['Tables']['classes']['Update'];

export interface ClassWithTeacher extends Class {
  teacher?: {
    id: string;
    full_name: string;
  } | null;
  enrolled_count?: number;
}

export const classesService = {
  async getAll(): Promise<ClassWithTeacher[]> {
    // Buscar turmas com professor
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:teacher_id (
          id,
          full_name
        )
      `)
      .order('name', { ascending: true });

    if (classesError) throw classesError;

    // Buscar contagem de alunos matriculados para cada turma
    const { data: enrollmentsData } = await supabase
      .from('enrollments')
      .select('class_id')
      .eq('status', 'enrolled');

    // Contar alunos por turma
    const enrollmentCounts: Record<string, number> = {};
    enrollmentsData?.forEach(enrollment => {
      enrollmentCounts[enrollment.class_id] = (enrollmentCounts[enrollment.class_id] || 0) + 1;
    });

    // Combinar dados
    return (classesData || []).map(cls => ({
      ...cls,
      enrolled_count: enrollmentCounts[cls.id] || 0,
    })) as ClassWithTeacher[];
  },

  async getById(id: string): Promise<ClassWithTeacher | null> {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:teacher_id (
          id,
          full_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Buscar contagem de alunos
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', id)
      .eq('status', 'enrolled');

    return {
      ...data,
      enrolled_count: count || 0,
    } as ClassWithTeacher;
  },

  async create(cls: ClassInsert): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .insert(cls)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ClassUpdate): Promise<Class> {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

