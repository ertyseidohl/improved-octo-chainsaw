// enums

// spawn wave enum
export enum WAVE_TYPE {
    NONE,
    DUMMY_DRONE,
    RANDOM,
    SWOOP_LEFT,
    SWOOP_RIGHT,
    BIGV,
    ROW_LEFT,
    ROW_RIGHT,
    ROW_STRAIGHT,
    BOSS,
    BOMB,
}

export enum COMPONENT_TYPES {
    BASIC_GUN,
    BIG_ENGINE,
    ENERGY_CELL,
    ENERGY_CELL_HD,
    ENGINE,
    PRINCE,
    SPACE_JUNK,
    SPACE_DIAMOND,
    SHIELD,
}

export enum ENEMY_TYPES {
    BASIC,
    BOSS,
    DUMMY_DRONE,
    BOMB,
}

export const MAX_HEALTH: number = 10; // TODO
export const MAX_ENGINE: number = 10;
export const MAX_WEIGHT: number = 10;
