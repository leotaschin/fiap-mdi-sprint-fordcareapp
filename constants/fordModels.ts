export type CarModel = 'Bronco' | 'Fusion' | 'Maverick' | 'Ranger' | 'Territory';
export type CarColor = 'black' | 'white' | 'blue' | 'red';

export type ModelConfig = {
  name: CarModel;
  colors: CarColor[];
};

export const FORD_MODELS: ModelConfig[] = [
  { name: 'Bronco',    colors: ['black', 'white'] },
  { name: 'Fusion',    colors: ['black', 'white', 'blue', 'red'] },
  { name: 'Maverick',  colors: ['black', 'white', 'blue', 'red'] },
  { name: 'Ranger',    colors: ['black', 'white', 'blue', 'red'] },
  { name: 'Territory', colors: ['black', 'white', 'blue', 'red'] },
];

export const COLOR_LABELS: Record<CarColor, string> = {
  black: 'Preto',
  white: 'Branco',
  blue:  'Azul',
  red:   'Vermelho',
};

export const COLOR_HEX: Record<CarColor, string> = {
  black: '#1C1C1E',
  white: '#D8D8D8',
  blue:  '#1D4E89',
  red:   '#C0392B',
};

// React Native exige requires estáticos — todos mapeados aqui
const CAR_IMAGES: Record<CarModel, Partial<Record<CarColor, any>>> = {
  Bronco: {
    black: require('@/assets/Carros/bronco_black.png'),
    white: require('@/assets/Carros/bronco_white.png'),
  },
  Fusion: {
    black: require('@/assets/Carros/fusion_black.png'),
    white: require('@/assets/Carros/fusion_white.png'),
    blue:  require('@/assets/Carros/fusion_blue.png'),
    red:   require('@/assets/Carros/fusion_red.png'),
  },
  Maverick: {
    black: require('@/assets/Carros/maverick_black.png'),
    white: require('@/assets/Carros/maverick_white.png'),
    blue:  require('@/assets/Carros/maverick_blue.png'),
    red:   require('@/assets/Carros/maverick_red.png'),
  },
  Ranger: {
    black: require('@/assets/Carros/ranger_black.png'),
    white: require('@/assets/Carros/ranger_white.png'),
    blue:  require('@/assets/Carros/ranger_blue.png'),
    red:   require('@/assets/Carros/ranger_red.png'),
  },
  Territory: {
    black: require('@/assets/Carros/territory_black.png'),
    white: require('@/assets/Carros/territory_white.png'),
    blue:  require('@/assets/Carros/territory_blue.png'),
    red:   require('@/assets/Carros/territory_red.png'),
  },
};

export function getCarImage(model: string, color: string) {
  return CAR_IMAGES[model as CarModel]?.[color as CarColor] ?? null;
}
