
import { Course } from '@/types/course';

export const levels: Course['level'][] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export const categories: Array<{ id: Course['category']; label: string }> = [
  { id: 'nice-guy-recovery', label: 'Nice Guy Recovery' },
  { id: 'relationship-skills', label: 'Relationship Skills' },
  { id: 'boundaries-communication', label: 'Boundaries & Communication' },
  { id: 'self-worth-identity', label: 'Self-Worth & Identity' },
];
