import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Grade = Database['public']['Tables']['grades']['Row'];
type GradeInsert = Database['public']['Tables']['grades']['Insert'];
type GradeUpdate = Database['public']['Tables']['grades']['Update'];
type GradingPeriod = Database['public']['Tables']['grading_periods']['Row'];

export interface GradeWithDetails extends Grade {
  student?: {
    id: string;
    full_name: string;
    registration_number: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  grading_period?: GradingPeriod;
}

export const gradesService = {
  async getByClassAndSubject(classId: string, subjectId: string, academicYear: number = 2024): Promise<GradeWithDetails[]> {
    // Buscar alunos da turma
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, registration_number')
      .eq('class_id', classId);

    if (!students || students.length === 0) {
      return [];
    }

    const studentIds = students.map(s => s.id);

    // Buscar períodos de avaliação do ano
    const { data: periods } = await supabase
      .from('grading_periods')
      .select('*')
      .eq('academic_year', academicYear)
      .eq('period_type', 'bimonthly')
      .order('period_number', { ascending: true });

    if (!periods || periods.length === 0) {
      return [];
    }

    // Buscar notas existentes
    const { data: existingGrades } = await supabase
      .from('grades')
      .select('*')
      .eq('subject_id', subjectId)
      .in('student_id', studentIds);

    // Criar mapa de notas por aluno e período
    const gradesMap = new Map<string, Map<number, Grade>>();
    
    existingGrades?.forEach((grade) => {
      const studentId = grade.student_id;
      const periodId = grade.grading_period_id;
      const period = periods.find(p => p.id === periodId);
      
      if (period) {
        if (!gradesMap.has(studentId)) {
          gradesMap.set(studentId, new Map());
        }
        gradesMap.get(studentId)!.set(period.period_number, grade);
      }
    });

    // Criar resultado combinando alunos, períodos e notas
    const result: GradeWithDetails[] = [];
    
    students.forEach(student => {
      periods.forEach(period => {
        const existingGrade = gradesMap.get(student.id)?.get(period.period_number);
        result.push({
          id: existingGrade?.id || `temp-${student.id}-${period.id}`,
          student_id: student.id,
          subject_id: subjectId,
          grading_period_id: period.id,
          score: existingGrade?.score || null,
          created_at: existingGrade?.created_at || null,
          updated_at: existingGrade?.updated_at || null,
          student: {
            id: student.id,
            full_name: student.full_name,
            registration_number: student.registration_number,
          },
          grading_period: period,
        } as GradeWithDetails);
      });
    });

    return result;
  },

  async upsertGrades(grades: Array<{
    student_id: string;
    subject_id: string;
    grading_period_id: string;
    score: number | null;
  }>): Promise<void> {
    // Filtrar apenas notas válidas (não null e entre 0 e 10)
    const validGrades = grades.filter(g => 
      g.score !== null && 
      g.score !== undefined && 
      g.score >= 0 && 
      g.score <= 10
    );

    if (validGrades.length === 0) {
      return;
    }

    // Fazer upsert em lote
    // O Supabase automaticamente usa a constraint UNIQUE (student_id, subject_id, grading_period_id)
    const { error } = await supabase
      .from('grades')
      .upsert(validGrades, {
        onConflict: 'student_id,subject_id,grading_period_id',
      });

    if (error) {
      console.error('Erro ao salvar notas:', error);
      throw error;
    }
  },

  async deleteGrade(id: string): Promise<void> {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

