export type Dealership = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
};

export const FORD_DEALERSHIPS: Dealership[] = [
  {
    id: '1',
    name: 'Ford Caoa Chery — Lapa',
    address: 'Av. Antártica, 381',
    neighborhood: 'Lapa',
    city: 'São Paulo',
    phone: '(11) 3675-0000',
    latitude: -23.5105,
    longitude: -46.7021,
  },
  {
    id: '2',
    name: 'Ford Sulamerica — Pinheiros',
    address: 'Av. Rebouças, 1585',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    phone: '(11) 3819-0000',
    latitude: -23.5629,
    longitude: -46.6799,
  },
  {
    id: '3',
    name: 'Ford Paulicéia — Santo André',
    address: 'Av. Industrial, 600',
    neighborhood: 'Centro',
    city: 'Santo André',
    phone: '(11) 4438-0000',
    latitude: -23.6567,
    longitude: -46.5289,
  },
];
