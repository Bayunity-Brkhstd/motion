import React from 'react';
import { Tema } from '../tema';

export interface StylePresetPhysics {
  spring_stiffness: number;
  spring_damping: number;
  dominant_transition: string;
  camera_shake_on_impact: boolean;
}

export interface StylePresetVisualGrammar {
  rendering_style?: string;
  stroke_rule?: string;
  character_or_object_rules?: string;
  background_style?: string;
}

export interface StylePresetTypography {
  font_family?: string;
  title_max_words?: number;
  subtitle_mode?: string;
  subtitle_position?: string;
  subtitle_stroke?: string;
}

export interface StylePreset extends Tema {
  slug?: string;
  display_name?: string;
  description?: string;
  avg_pacing_sec?: number;
  aspect_ratio?: string;
  palette_hex?: string[];
  visual_grammar?: StylePresetVisualGrammar;
  typography_and_subtitle?: StylePresetTypography;
  physics?: StylePresetPhysics;
}
