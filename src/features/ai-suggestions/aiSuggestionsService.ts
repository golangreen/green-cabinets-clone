/**
 * AI-powered design suggestions service
 * Provides intelligent recommendations using Lovable AI
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DesignPreferences {
  style?: 'modern' | 'traditional' | 'transitional' | 'rustic' | 'contemporary';
  budget?: 'low' | 'medium' | 'high' | 'luxury';
  colorScheme?: 'light' | 'dark' | 'neutral' | 'bold';
  roomSize?: 'small' | 'medium' | 'large';
  priorities?: Array<'aesthetics' | 'durability' | 'cost' | 'sustainability'>;
}

export interface VanityConfiguration {
  brand: string;
  finish: string;
  width: number;
  depth: number;
  height: number;
  hasMirrorCabinet: boolean;
  sinkType?: string;
  hardwareFinish?: string;
}

export interface DesignSuggestion {
  category: 'material' | 'dimension' | 'style' | 'cost' | 'compatibility';
  title: string;
  description: string;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: {
    brand?: string;
    finish?: string;
    width?: number;
    depth?: number;
    hardwareFinish?: string;
    estimatedSavings?: number;
  };
}

/**
 * Get AI-powered design suggestions based on user preferences and current configuration
 */
export const getDesignSuggestions = async (
  preferences: DesignPreferences,
  currentConfig: VanityConfiguration
): Promise<DesignSuggestion[]> => {
  try {
    logger.info('Requesting AI design suggestions', { preferences, currentConfig });

    const { data, error } = await supabase.functions.invoke('ai-design-suggestions', {
      body: {
        preferences,
        currentConfig,
      },
    });

    if (error) {
      logger.error('AI suggestions request failed', error);
      throw error;
    }

    logger.info('AI suggestions received', { count: data?.suggestions?.length });
    return data.suggestions || [];
  } catch (error) {
    logger.error('Failed to get AI suggestions', error);
    throw error;
  }
};

/**
 * Get style recommendations based on room photo analysis
 * (Future: implement image analysis)
 */
export const getStyleRecommendations = async (
  roomPhotoUrl: string
): Promise<DesignSuggestion[]> => {
  try {
    logger.info('Analyzing room photo for style recommendations', { roomPhotoUrl });

    const { data, error } = await supabase.functions.invoke('analyze-room-style', {
      body: { roomPhotoUrl },
    });

    if (error) {
      logger.error('Room analysis failed', error);
      throw error;
    }

    return data.recommendations || [];
  } catch (error) {
    logger.error('Failed to analyze room style', error);
    throw error;
  }
};

/**
 * Optimize dimensions based on bathroom constraints
 */
export const optimizeDimensions = async (
  bathroomWidth: number,
  bathroomDepth: number,
  constraints?: string[]
): Promise<DesignSuggestion[]> => {
  try {
    logger.info('Optimizing vanity dimensions', { bathroomWidth, bathroomDepth, constraints });

    const { data, error } = await supabase.functions.invoke('optimize-dimensions', {
      body: {
        bathroomWidth,
        bathroomDepth,
        constraints: constraints || [],
      },
    });

    if (error) {
      logger.error('Dimension optimization failed', error);
      throw error;
    }

    return data.suggestions || [];
  } catch (error) {
    logger.error('Failed to optimize dimensions', error);
    throw error;
  }
};

/**
 * Find cost-effective alternatives to current configuration
 */
export const findAlternatives = async (
  currentConfig: VanityConfiguration,
  targetBudget?: number
): Promise<DesignSuggestion[]> => {
  try {
    logger.info('Finding cost alternatives', { currentConfig, targetBudget });

    const { data, error } = await supabase.functions.invoke('find-alternatives', {
      body: {
        currentConfig,
        targetBudget,
      },
    });

    if (error) {
      logger.error('Alternative search failed', error);
      throw error;
    }

    return data.alternatives || [];
  } catch (error) {
    logger.error('Failed to find alternatives', error);
    throw error;
  }
};

/**
 * Get finish pairing suggestions (countertop, hardware, backsplash)
 */
export const getFinishPairings = async (
  cabinetFinish: string,
  cabinetBrand: string
): Promise<{
  countertops: string[];
  hardware: string[];
  backsplash: string[];
}> => {
  try {
    logger.info('Getting finish pairing suggestions', { cabinetFinish, cabinetBrand });

    const { data, error } = await supabase.functions.invoke('suggest-finish-pairings', {
      body: {
        cabinetFinish,
        cabinetBrand,
      },
    });

    if (error) {
      logger.error('Finish pairing request failed', error);
      throw error;
    }

    return data.pairings || { countertops: [], hardware: [], backsplash: [] };
  } catch (error) {
    logger.error('Failed to get finish pairings', error);
    throw error;
  }
};
