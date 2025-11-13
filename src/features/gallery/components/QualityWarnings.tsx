/**
 * Quality Warnings Component
 * Displays image quality badges and warnings
 */

import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { ImageQualityResult } from '../types';
import { getQualityBadgeVariant, getQualityStatusText } from '../services/imageProcessingService';

interface QualityWarningsProps {
  quality: ImageQualityResult;
  className?: string;
}

export function QualityWarnings({ quality, className }: QualityWarningsProps) {
  const hasIssues = !quality.issues.includes('none');

  if (!hasIssues) {
    return null;
  }

  return (
    <div className={className}>
      <Badge variant={getQualityBadgeVariant(quality)} className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        {getQualityStatusText(quality)}
      </Badge>
      
      {quality.overallQuality === 'poor' && (
        <p className="text-xs text-destructive mt-1">
          This image may not meet quality standards for gallery display
        </p>
      )}
    </div>
  );
}
