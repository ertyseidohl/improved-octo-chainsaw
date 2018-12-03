import BaseEnemy from "./base_enemy";

export default class BasicEnemy extends BaseEnemy {
    public shouldSpawnPowerup(): boolean {
        return true;
    }
}
