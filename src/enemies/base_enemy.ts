export default class BaseEnemy extends Phaser.Sprite {
    public update(): void {
        super.update();
        const thisBody: Phaser.Physics.P2.Body = this.body;
        thisBody.velocity.y += 2;
    }
}
