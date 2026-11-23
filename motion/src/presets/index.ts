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
import { preset_anime_pedesaan } from './anime-pedesaan';
import { preset_art_nouveau } from './art-nouveau';
import { preset_ascii } from './ascii';
import { preset_balok_mainan } from './balok-mainan';
import { preset_batik } from './batik';
import { preset_blueprint } from './blueprint';
import { preset_boneka_rajut } from './boneka-rajut';
import { preset_cat_air } from './cat-air';
import { preset_cetak_kayu_jepang } from './cetak-kayu-jepang';
import { preset_clay } from './clay';
import { preset_dijadikan_kontak_darurat_pinjol_wajib_bayar_shorts_hukum_semenit_1080p_h264 } from './dijadikan-kontak-darurat-pinjol-wajib-bayar-shorts-hukum-semenit-1080p-h264';
import { preset_flat_vector } from './flat-vector';
import { preset_garis_minimal } from './garis-minimal';
import { preset_glitch } from './glitch';
import { preset_golden_hour } from './golden-hour';
import { preset_gouache_malam } from './gouache-malam';
import { preset_hologram } from './hologram';
import { preset_impasto_minyak } from './impasto-minyak';
import { preset_kamera_panas } from './kamera-panas';
import { preset_kapur_tulis } from './kapur-tulis';
import { preset_kartun_gerak } from './kartun-gerak';
import { preset_kartun_jadul } from './kartun-jadul';
import { preset_kertas_potong } from './kertas-potong';
import { preset_komik } from './komik';
import { preset_lukisan_botani } from './lukisan-botani';
import { preset_mozaik_romawi } from './mozaik-romawi';
import { preset_neon } from './neon';
import { preset_origami } from './origami';
import { preset_pixel_art } from './pixel-art';
import { preset_ps2_3d } from './ps2-3d';
import { preset_sketsa_pensil } from './sketsa-pensil';
import { preset_snaptik_animasi_ref } from './snaptik-animasi-ref';
import { preset_tinta_sumie } from './tinta-sumie';
// CUSTOM_PRESETS_END

export const STYLE_PRESETS: Record<string, StylePreset> = {
  ...builtInPresets,
  '3d-custom': preset_preset_3d_custom,
  'anime-pedesaan': preset_anime_pedesaan,
  'art-nouveau': preset_art_nouveau,
  'ascii': preset_ascii,
  'balok-mainan': preset_balok_mainan,
  'batik': preset_batik,
  'blueprint': preset_blueprint,
  'boneka-rajut': preset_boneka_rajut,
  'cat-air': preset_cat_air,
  'cetak-kayu-jepang': preset_cetak_kayu_jepang,
  'clay': preset_clay,
  'dijadikan-kontak-darurat-pinjol-wajib-bayar-shorts-hukum-semenit-1080p-h264': preset_dijadikan_kontak_darurat_pinjol_wajib_bayar_shorts_hukum_semenit_1080p_h264,
  'flat-vector': preset_flat_vector,
  'garis-minimal': preset_garis_minimal,
  'glitch': preset_glitch,
  'golden-hour': preset_golden_hour,
  'gouache-malam': preset_gouache_malam,
  'hologram': preset_hologram,
  'impasto-minyak': preset_impasto_minyak,
  'kamera-panas': preset_kamera_panas,
  'kapur-tulis': preset_kapur_tulis,
  'kartun-gerak': preset_kartun_gerak,
  'kartun-jadul': preset_kartun_jadul,
  'kertas-potong': preset_kertas_potong,
  'komik': preset_komik,
  'lukisan-botani': preset_lukisan_botani,
  'mozaik-romawi': preset_mozaik_romawi,
  'neon': preset_neon,
  'origami': preset_origami,
  'pixel-art': preset_pixel_art,
  'ps2-3d': preset_ps2_3d,
  'sketsa-pensil': preset_sketsa_pensil,
  'snaptik-animasi-ref': preset_snaptik_animasi_ref,
  'tinta-sumie': preset_tinta_sumie,
};

export const getPreset = (name?: string): StylePreset => {
  if (name && STYLE_PRESETS[name]) {
    return STYLE_PRESETS[name];
  }
  return STYLE_PRESETS['garis'] || Object.values(STYLE_PRESETS)[0];
};

export * from './types';
