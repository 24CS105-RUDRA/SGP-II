import { unstable_cache } from 'next/cache';
import { getDatabase } from './db';

const CACHE_TAGS = {
  TIMETABLE: 'timetable',
  NOTICES: 'notices',
  FEE_STRUCTURE: 'fee-structure',
  GALLERY: 'gallery',
} as const;

const REVALIDATE_TIMETABLE = 60 * 60;
const REVALIDATE_NOTICES = 60 * 5;
const REVALIDATE_FEE_STRUCTURE = 60 * 60 * 24;
const REVALIDATE_GALLERY = 60 * 15;

export async function getTimetableCached(
  standard: string,
  division: string,
  day: string
) {
  const cacheFn = unstable_cache(
    async () => {
      try {
        const db = await getDatabase();
        const timetableCollection = db.collection('timetable');

        const timetable = await timetableCollection.findOne({
          standard,
          division,
          day,
        });

        return timetable;
      } catch (error) {
        console.error('[Cache] Error fetching timetable:', error);
        return null;
      }
    },
    [`timetable-${standard}-${division}-${day}`],
    {
      tags: [CACHE_TAGS.TIMETABLE],
      revalidate: REVALIDATE_TIMETABLE,
    }
  );

  return cacheFn();
}

export async function getWeeklyTimetableCached(
  standard: string,
  division: string
) {
  const cacheFn = unstable_cache(
    async () => {
      try {
        const db = await getDatabase();
        const timetableCollection = db.collection('timetable');

        const timetable = await timetableCollection
          .find({
            standard,
            division,
          })
          .sort({ day: 1 })
          .toArray();

        return timetable;
      } catch (error) {
        console.error('[Cache] Error fetching weekly timetable:', error);
        return [];
      }
    },
    [`timetable-weekly-${standard}-${division}`],
    {
      tags: [CACHE_TAGS.TIMETABLE],
      revalidate: REVALIDATE_TIMETABLE,
    }
  );

  return cacheFn();
}

export async function getNoticesCached(
  role?: string,
  standard?: string
) {
  const cacheKey = `notices-${role || 'all'}-${standard || 'all'}`;
  
  const cacheFn = unstable_cache(
    async () => {
      try {
        const db = await getDatabase();
        const noticesCollection = db.collection('notices');

        const query: Record<string, unknown> = {};
        
        if (role) {
          query.$or = [
            { target_roles: role },
            { target_roles: 'all' },
          ];
        }

        if (standard && standard !== 'all') {
          query.$or = query.$or || [];
          (query.$or as Array<Record<string, unknown>>).push(
            { target_standards: standard },
            { target_standards: { $exists: false } },
            { target_standards: null }
          );
        }

        const notices = await noticesCollection
          .find(query)
          .sort({ priority: -1, created_at: -1 })
          .limit(50)
          .toArray();

        return notices;
      } catch (error) {
        console.error('[Cache] Error fetching notices:', error);
        return [];
      }
    },
    [cacheKey],
    {
      tags: [CACHE_TAGS.NOTICES],
      revalidate: REVALIDATE_NOTICES,
    }
  );

  return cacheFn();
}

export async function getGeneralNoticesCached() {
  const cacheFn = unstable_cache(
    async () => {
      try {
        const db = await getDatabase();
        const noticesCollection = db.collection('notices');

        const notices = await noticesCollection
          .find({
            $or: [
              { target_roles: 'all' },
              { target_roles: { $exists: false } },
            ],
          })
          .sort({ priority: -1, created_at: -1 })
          .limit(20)
          .toArray();

        return notices;
      } catch (error) {
        console.error('[Cache] Error fetching general notices:', error);
        return [];
      }
    },
    ['notices-general'],
    {
      tags: [CACHE_TAGS.NOTICES],
      revalidate: REVALIDATE_NOTICES,
    }
  );

  return cacheFn();
}

export async function getFeeStructureCached(
  standard: string,
  academicYear: string
) {
  const cacheFn = unstable_cache(
    async () => {
      try {
        const db = await getDatabase();
        const feesCollection = db.collection('fee_structures');

        const feeStructure = await feesCollection.findOne({
          standard,
          academic_year: academicYear,
        });

        return feeStructure;
      } catch (error) {
        console.error('[Cache] Error fetching fee structure:', error);
        return null;
      }
    },
    [`fee-structure-${standard}-${academicYear}`],
    {
      tags: [CACHE_TAGS.FEE_STRUCTURE],
      revalidate: REVALIDATE_FEE_STRUCTURE,
    }
  );

  return cacheFn();
}

export function revalidateTimetable(): void {
  console.log('[Cache] Revalidating timetable');
}

export function revalidateNotices(): void {
  console.log('[Cache] Revalidating notices');
}

export function revalidateFeeStructure(): void {
  console.log('[Cache] Revalidating fee structure');
}

export function revalidateGallery(): void {
  console.log('[Cache] Revalidating gallery');
}
