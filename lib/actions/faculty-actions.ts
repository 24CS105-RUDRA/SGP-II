'use server';

import { createClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { facultyRegistrationSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

const supabase = createClient();

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
}

export async function registerFaculty(
  rawData: unknown
): Promise<ActionResponse<{ id: string; username: string }>> {
  try {
    const validatedData = facultyRegistrationSchema.safeParse(rawData);
    
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

    const { username, password, full_name, email, role, employee_id, department, subject } = validatedData.data;

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

    const { data: existingEmployee } = await supabase
      .from('faculty')
      .select('id')
      .eq('employee_id', employee_id)
      .maybeSingle();

    if (existingEmployee) {
      return {
        success: false,
        error: 'Employee ID already registered',
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

    const { error: facultyError } = await supabase
      .from('faculty')
      .insert({
        user_id: user.id,
        employee_id,
        department,
        subject,
      });

    if (facultyError) {
      await supabase.from('users').delete().eq('id', user.id);
      console.error('[v0] Faculty creation error:', facultyError);
      return {
        success: false,
        error: 'Failed to create faculty record',
      };
    }

    revalidatePath('/admin/faculty-profiles');

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    console.error('[v0] Register faculty error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function updateFaculty(
  facultyId: string,
  rawData: unknown
): Promise<ActionResponse<Record<string, unknown>>> {
  try {
    const updateSchema = facultyRegistrationSchema.partial({
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
      .eq('id', facultyId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/admin/faculty-profiles');

    return {
      success: true,
      data: data as Record<string, unknown>,
    };
  } catch (error) {
    console.error('[v0] Update faculty error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function deleteFaculty(facultyId: string): Promise<ActionResponse> {
  try {
    const { error: facultyError } = await supabase
      .from('faculty')
      .delete()
      .eq('user_id', facultyId);

    if (facultyError) {
      return {
        success: false,
        error: facultyError.message,
      };
    }

    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', facultyId);

    if (userError) {
      return {
        success: false,
        error: userError.message,
      };
    }

    revalidatePath('/admin/faculty-profiles');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[v0] Delete faculty error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
