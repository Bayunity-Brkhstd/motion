import { TEMA } from '../tema';
import { StylePreset } from './types';

// Built-in presets from existing themes
const builtInPresets: Record<string, StylePreset> = {};
for (const [key, tema] of Object.entries(TEMA)) {
  builtInPresets[key] = {
    ...tema,
    slug: key,
    display_name: tema.nama,
    avg_pacing_sec: 3.5,
  };
}

// Custom presets will be registered here by scripts/generate_style_artifacts.py
// CUSTOM_PRESETS_START
import { preset_toon_3d_celshaded } from './toon-3d-celshaded';
import { preset_preset_3d_custom } from './3d-custom';
// CUSTOM_PRESETS_END

export const STYLE_PRESETS: Record<string, StylePreset> = {
  ...builtInPresets,
  '3d-custom': preset_preset_3d_custom,
  'toon-3d-celshaded': preset_toon_3d_celshaded,
};

export const getPreset = (name?: string): StylePreset => {
  if (name && STYLE_PRESETS[name]) {
    return STYLE_PRESETS[name];
  }
  return STYLE_PRESETS['garis'] || Object.values(STYLE_PRESETS)[0];
};

export * from './types';
