import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export interface StudentWithClass extends Student {
  classes?: {
    name: string;
    id: string;
  } | null;
}

export const studentsService = {
  async getAll(): Promise<StudentWithClass[]> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id (
          id,
          name
        )
      `)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data as StudentWithClass[];
  },

  async getById(id: string): Promise<StudentWithClass | null> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes:class_id (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as StudentWithClass;
  },

  async create(student: StudentInsert): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: StudentUpdate): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

