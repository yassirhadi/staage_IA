import { cn } from '@/lib/utils';

/**
 * Mirrors the `confidentiality_level` ENUM in the `documents` table
 * (database/schema.sql). Keep this list in sync with the backend enum
 * ConfidentialityLevel.java.
 */
export type ConfidentialityLevel =
  | 'NON_CLASSIFIE'
  | 'PUBLIC'
  | 'INTERNE'
  | 'CONFIDENTIEL'
  | 'TRES_CONFIDENTIEL';

const LABELS: Record<ConfidentialityLevel, string> = {
  NON_CLASSIFIE: 'Non classifié',
  PUBLIC: 'Public',
  INTERNE: 'Interne',
  CONFIDENTIEL: 'Confidentiel',
  TRES_CONFIDENTIEL: 'Très confidentiel',
};

// Escalating severity -> color, so the stamp's weight reads at a glance.
const COLORS: Record<ConfidentialityLevel, string> = {
  NON_CLASSIFIE: 'text-muted-foreground',
  PUBLIC: 'text-[hsl(var(--conformity))]',
  INTERNE: 'text-primary',
  CONFIDENTIEL: 'text-[hsl(28_80%_58%)]',
  TRES_CONFIDENTIEL: 'text-[hsl(var(--destructive))]',
};

interface ClassificationStampProps {
  level: ConfidentialityLevel;
  className?: string;
}

export function ClassificationStamp({ level, className }: ClassificationStampProps) {
  return (
    <span className={cn('classification-stamp', COLORS[level], className)}>
      {LABELS[level]}
    </span>
  );
}
