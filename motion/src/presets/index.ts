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

// CUSTOM_PRESETS_START
import { preset_preset_3d_custom } from './3d-custom';
import { preset_dijadikan_kontak_darurat_pinjol_wajib_bayar_shorts_hukum_semenit_1080p_h264 } from './dijadikan-kontak-darurat-pinjol-wajib-bayar-shorts-hukum-semenit-1080p-h264';
import { preset_kartun_gerak } from './kartun-gerak';
// CUSTOM_PRESETS_END

export const STYLE_PRESETS: Record<string, StylePreset> = {
  ...builtInPresets,
  '3d-custom': preset_preset_3d_custom,
  'dijadikan-kontak-darurat-pinjol-wajib-bayar-shorts-hukum-semenit-1080p-h264': preset_dijadikan_kontak_darurat_pinjol_wajib_bayar_shorts_hukum_semenit_1080p_h264,
  'kartun-gerak': preset_kartun_gerak,
};

export const getPreset = (name?: string): StylePreset => {
  if (name && STYLE_PRESETS[name]) {
    return STYLE_PRESETS[name];
  }
  return STYLE_PRESETS['garis'] || Object.values(STYLE_PRESETS)[0];
};

export * from './types';
