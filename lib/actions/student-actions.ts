'use server';

import { createClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { studentRegistrationSchema, studentRegistrationSchema as StudentSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

const supabase = createClient();

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
}

export async function registerStudent(
  rawData: unknown
): Promise<ActionResponse<{ id: string; username: string }>> {
  try {
    const validatedData = studentRegistrationSchema.safeParse(rawData);
    
    if (!validatedData.success) {
      const issues = validatedData.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return {
        success: false,
        error: 'Validation failed',
        issues,
      };
    }

    const { username, password, full_name, email, role, year_of_study, division, standard, roll_number, parent_contact, date_of_birth } = validatedData.data;

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return {
        success: false,
        error: 'Phone number already registered',
      };
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        full_name,
        email,
        role,
        year_of_study,
        division,
        standard,
      })
      .select('id, username')
      .single();

    if (userError || !user) {
      console.error('[v0] User creation error:', userError);
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    const { error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: user.id,
        roll_number,
        parent_contact,
        date_of_birth,
      });

    if (studentError) {
      await supabase.from('users').delete().eq('id', user.id);
      console.error('[v0] Student creation error:', studentError);
      return {
        success: false,
        error: 'Failed to create student record',
      };
    }

    revalidatePath('/admin/student-lists');
    revalidatePath('/admin/student-profiles');

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    console.error('[v0] Register student error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function updateStudent(
  studentId: string,
  rawData: unknown
): Promise<ActionResponse<Record<string, unknown>>> {
  try {
    const updateSchema = studentRegistrationSchema.partial({
      password: true,
      role: true,
    });
    
    const validatedData = updateSchema.safeParse(rawData);
    
    if (!validatedData.success) {
      const issues = validatedData.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return {
        success: false,
        error: 'Validation failed',
        issues,
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update(validatedData.data)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/admin/student-lists');
    revalidatePath('/admin/student-profiles');

    return {
      success: true,
      data: data as Record<string, unknown>,
    };
  } catch (error) {
    console.error('[v0] Update student error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function deleteStudent(studentId: string): Promise<ActionResponse> {
  try {
    const { error: studentError } = await supabase
      .from('students')
      .delete()
      .eq('user_id', studentId);

    if (studentError) {
      return {
        success: false,
        error: studentError.message,
      };
    }

    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', studentId);

    if (userError) {
      return {
        success: false,
        error: userError.message,
      };
    }

    revalidatePath('/admin/student-lists');
    revalidatePath('/admin/student-profiles');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[v0] Delete student error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
