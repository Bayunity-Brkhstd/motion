// Pustaka Template Khusus Animasi Bergerak (Kinetic Rig Engine)
// Terpisah total dari template video grafis statis

export interface AnimationPreset {
  id: string;
  nama: string;
  kategori: 'animasi-bergerak';
  deskripsi: string;
  rigDefault: 'toon-3d' | 'stickman' | 'isometric' | 'custom' | string;
  latarDefault: string;
  pacingSec: number;
  aksen: string;
  badge: string;
  fiturVisual: string[];
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  'toon-3d': {
    id: 'toon-3d',
    nama: 'Toon 3D Cel-Shaded Explainer',
    kategori: 'animasi-bergerak',
    deskripsi: 'Gaya edukasi teknis 3D Cel-shaded (South Park/Fern style), inverted hull outline hitam tegas, mitten hands tanpa jari, efek cutaway X-ray holografik, dan meja blueprint interaktif.',
    rigDefault: 'toon-3d',
    latarDefault: 'blueprint',
    pacingSec: 3.0,
    aksen: '#38BDF8',
    badge: '3D Cel-Shaded',
    fiturVisual: [
      'Inverted Hull Outline Hitam',
      'Mata Oval Putih & Mitten Hands',
      'Meja Blueprint Interaktif',
      'Efek Cutaway / X-Ray Hologram',
      'Pacing Cepat 2–4 Detik'
    ]
  },
  'stickman': {
    id: 'stickman',
    nama: '2D Kinetic Stickman Action',
    kategori: 'animasi-bergerak',
    deskripsi: 'Karakter stickman kinetik dinamis di perkotaan/kantor dengan siklus jalan dan lari (walk/run cycle), ayunan pundak dan siku, serta properti interaktif.',
    rigDefault: 'stickman',
    latarDefault: 'kota',
    pacingSec: 3.5,
    aksen: '#2563EB',
    badge: '2D Kinetic',
    fiturVisual: [
      'Siklus Kaki Melangkah sin(t)',
      'Ayunan Tangan & Sendi Siku',
      'Latar Perkotaan & Gedung',
      'Lip-sync Mulut Berbicara'
    ]
  },
  'isometric': {
    id: 'isometric',
    nama: '3D Isometric Tech Engine',
    kategori: 'animasi-bergerak',
    deskripsi: 'Pemandangan isometrik balok 3D mengambang, conveyor grid teknologi, dan maskot drone dengan lampu indikator.',
    rigDefault: 'isometric',
    latarDefault: 'isometric-grid',
    pacingSec: 4.0,
    aksen: '#4ECCA3',
    badge: '3D Isometric',
    fiturVisual: [
      'Grid Balok Isometrik Mengambang',
      'Efek Kedip Lampu LED Server',
      'Transisi Kamera Isometrik 30°',
      'Maskot Drone Karakter'
    ]
  }
};

export const getAnimationPreset = (id?: string): AnimationPreset => {
  if (id && ANIMATION_PRESETS[id]) {
    return ANIMATION_PRESETS[id];
  }
  return ANIMATION_PRESETS['toon-3d'];
};
