import { Cpu, Leaf, Recycle, ShieldAlert } from 'lucide-react';
import { WasteCategoryId } from '../types/ecosort';

interface CategoryIconProps {
  category: WasteCategoryId;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const boxSize =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : size === 'lg'
        ? 'w-12 h-12 rounded-xl'
        : 'w-10 h-10 rounded-xl';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  if (category === 'dry') {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 ${boxSize}`}
        aria-hidden="true"
      >
        <Recycle className={iconSize} />
      </span>
    );
  }
  if (category === 'wet') {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700 ${boxSize}`}
        aria-hidden="true"
      >
        <Leaf className={iconSize} />
      </span>
    );
  }
  if (category === 'ewaste') {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 ${boxSize}`}
        aria-hidden="true"
      >
        <Cpu className={iconSize} />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 bg-red-50 text-red-600 ${boxSize}`}
      aria-hidden="true"
    >
      <ShieldAlert className={iconSize} />
    </span>
  );
}
