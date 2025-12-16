import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Teacher = Database['public']['Tables']['teachers']['Row'];
type TeacherInsert = Database['public']['Tables']['teachers']['Insert'];
type TeacherUpdate = Database['public']['Tables']['teachers']['Update'];
type TeacherSubject = Database['public']['Tables']['teacher_subjects']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];

export interface TeacherWithSubjects extends Teacher {
  subjects?: Array<{
    subject: Subject;
    id: string;
  }>;
}

export const teachersService = {
  async getAll(): Promise<TeacherWithSubjects[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        teacher_subjects (
          id,
          subject:subjects!inner (
            id,
            name,
            code
          )
        )
      `)
      .order('full_name', { ascending: true });

    if (error) throw error;
    
    // Transformar a estrutura para facilitar o uso
    return (data || []).map(teacher => ({
      ...teacher,
      subjects: teacher.teacher_subjects?.map((ts: any) => ({
        id: ts.id,
        subject: ts.subject,
      })) || [],
    })) as TeacherWithSubjects[];
  },

  async getById(id: string): Promise<TeacherWithSubjects | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        teacher_subjects (
          id,
          subject:subjects!inner (
            id,
            name,
            code
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      subjects: (data.teacher_subjects as any)?.map((ts: any) => ({
        id: ts.id,
        subject: ts.subject,
      })) || [],
    } as TeacherWithSubjects;
  },

  async create(teacher: TeacherInsert, subjectIds?: string[]): Promise<Teacher> {
    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .insert(teacher)
      .select()
      .single();

    if (teacherError) throw teacherError;

    // Adicionar disciplinas se fornecidas
    if (subjectIds && subjectIds.length > 0 && teacherData) {
      const teacherSubjects = subjectIds.map(subjectId => ({
        teacher_id: teacherData.id,
        subject_id: subjectId,
      }));

      const { error: subjectsError } = await supabase
        .from('teacher_subjects')
        .insert(teacherSubjects);

      if (subjectsError) throw subjectsError;
    }

    return teacherData;
  },

  async update(id: string, updates: TeacherUpdate, subjectIds?: string[]): Promise<Teacher> {
    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar disciplinas se fornecidas
    if (subjectIds !== undefined) {
      // Remover todas as disciplinas existentes
      await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', id);

      // Adicionar novas disciplinas
      if (subjectIds.length > 0) {
        const teacherSubjects = subjectIds.map(subjectId => ({
          teacher_id: id,
          subject_id: subjectId,
        }));

        const { error: subjectsError } = await supabase
          .from('teacher_subjects')
          .insert(teacherSubjects);

        if (subjectsError) throw subjectsError;
      }
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

