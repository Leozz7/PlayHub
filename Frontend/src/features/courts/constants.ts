export const SPORTS_LIST = [
    'Futebol Society',
    'Beach Tennis',
    'Vôlei de Praia',
    'Basquete',
    'Futsal',
    'Padel',
    'Futevôlei',
    'Tênis',
    'Handebol',
] as const;

export type Sport = typeof SPORTS_LIST[number];

export const CITIES = [
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Curitiba',
    'Porto Alegre',
] as const;

export type City = typeof CITIES[number];
