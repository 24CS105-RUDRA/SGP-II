'use server';

import bcrypt from 'bcryptjs';
import { getDatabase, withTransaction } from '@/lib/db';
import { studentRegistrationSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';
import { Collection, ObjectId } from 'mongodb';

interface StudentData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: 'student';
  year_of_study: string;
  division: string;
  standard: string;
  roll_number: string;
  parent_contact?: string;
  date_of_birth?: string;
}

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
}

export async function registerStudentMongo(
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

    const db = await getDatabase();
    const studentData: StudentData = validatedData.data;
    const passwordHash = await bcrypt.hash(studentData.password, 12);

    const result = await withTransaction(async (session) => {
      const usersCollection: Collection = db.collection('users');
      const studentsCollection: Collection = db.collection('students');

      const existingUser = await usersCollection.findOne(
        { username: studentData.username },
        { session }
      );
      
      if (existingUser) {
        throw new Error('PHONE_NUMBER_EXISTS');
      }

      const existingEmail = await usersCollection.findOne(
        { email: studentData.email },
        { session }
      );
      
      if (existingEmail) {
        throw new Error('EMAIL_EXISTS');
      }

      const existingRoll = await studentsCollection.findOne(
        { 
          roll_number: studentData.roll_number,
          standard: studentData.standard,
          division: studentData.division
        },
        { session }
      );
      
      if (existingRoll) {
        throw new Error('ROLL_NUMBER_EXISTS');
      }

      const userDoc = {
        username: studentData.username,
        password_hash: passwordHash,
        full_name: studentData.full_name,
        email: studentData.email,
        role: studentData.role,
        year_of_study: studentData.year_of_study,
        division: studentData.division,
        standard: studentData.standard,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const userResult = await usersCollection.insertOne(userDoc, { session });

      const studentDoc = {
        user_id: userResult.insertedId,
        roll_number: studentData.roll_number,
        parent_contact: studentData.parent_contact,
        date_of_birth: studentData.date_of_birth,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const studentResult = await studentsCollection.insertOne(studentDoc, { session });

      return {
        userId: userResult.insertedId.toString(),
        studentId: studentResult.insertedId.toString(),
        username: studentData.username,
      };
    });

    revalidatePath('/admin/student-lists');
    revalidatePath('/admin/student-profiles');

    return {
      success: true,
      data: {
        id: result.userId,
        username: result.username,
      },
    };
  } catch (error) {
    console.error('[MongoDB] Register student error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    
    if (errorMessage === 'PHONE_NUMBER_EXISTS') {
      return {
        success: false,
        error: 'Phone number already registered',
      };
    }
    
    if (errorMessage === 'EMAIL_EXISTS') {
      return {
        success: false,
        error: 'Email already registered',
      };
    }
    
    if (errorMessage === 'ROLL_NUMBER_EXISTS') {
      return {
        success: false,
        error: 'Roll number already exists for this class',
      };
    }
    
    return {
      success: false,
      error: 'Failed to register student. Please try again.',
    };
  }
}

export async function registerFacultyMongo(
  rawData: unknown
): Promise<ActionResponse<{ id: string; username: string }>> {
  try {
    const { facultyRegistrationSchema } = await import('@/lib/schemas');
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

    const db = await getDatabase();
    const facultyData = validatedData.data;
    const passwordHash = await bcrypt.hash(facultyData.password, 12);

    const result = await withTransaction(async (session) => {
      const usersCollection: Collection = db.collection('users');
      const facultyCollection: Collection = db.collection('faculty');

      const existingUser = await usersCollection.findOne(
        { username: facultyData.username },
        { session }
      );
      
      if (existingUser) {
        throw new Error('PHONE_NUMBER_EXISTS');
      }

      const existingEmployee = await facultyCollection.findOne(
        { employee_id: facultyData.employee_id },
        { session }
      );
      
      if (existingEmployee) {
        throw new Error('EMPLOYEE_ID_EXISTS');
      }

      const userDoc = {
        username: facultyData.username,
        password_hash: passwordHash,
        full_name: facultyData.full_name,
        email: facultyData.email,
        role: facultyData.role,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const userResult = await usersCollection.insertOne(userDoc, { session });

      const facultyDoc = {
        user_id: userResult.insertedId,
        employee_id: facultyData.employee_id,
        department: facultyData.department,
        subject: facultyData.subject,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const facultyResult = await facultyCollection.insertOne(facultyDoc, { session });

      return {
        userId: userResult.insertedId.toString(),
        facultyId: facultyResult.insertedId.toString(),
        username: facultyData.username,
      };
    });

    revalidatePath('/admin/faculty-profiles');

    return {
      success: true,
      data: {
        id: result.userId,
        username: result.username,
      },
    };
  } catch (error) {
    console.error('[MongoDB] Register faculty error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    
    if (errorMessage === 'PHONE_NUMBER_EXISTS') {
      return {
        success: false,
        error: 'Phone number already registered',
      };
    }
    
    if (errorMessage === 'EMPLOYEE_ID_EXISTS') {
      return {
        success: false,
        error: 'Employee ID already registered',
      };
    }
    
    return {
      success: false,
      error: 'Failed to register faculty. Please try again.',
    };
  }
}
