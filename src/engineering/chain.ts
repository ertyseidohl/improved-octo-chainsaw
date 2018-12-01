import { Point } from "phaser-ce";

export default class Wire extends Phaser.Group {
    constructor(
        game: Phaser.Game,
        parent: PIXI.DisplayObjectContainer,
        name: string,
        private startPoint: Phaser.Point,
        private endPoint: Phaser.Point,
    ) {
        super(game, parent, name);

        let lastRect;
        const height = 20;
        const width = 16;
        const maxForce = 20000;

        for (let i: number = 0; i <= length; i++) {
            let newRect: Phaser.Sprite;

            const x: number = startPoint.x;                    //  All rects are on the same x position
            const y: number  = startPoint.y + (i * height);     //  Every new rect is positioned below the last

            if (i % 2 === 0) {
                //  Add sprite (and switch frame every 2nd time)
                newRect = game.add.sprite(x, y, "chain", 1);
            } else {
                newRect = game.add.sprite(x, y, "chain", 0);
                lastRect.bringToTop();
            }

            //  Enable physicsbody
            game.physics.p2.enable(newRect, false);

            //  Set custom rectangle
            newRect.body.setRectangle(width, height);

            if (i === 0) {
                newRect.body.static = true;
            } else {
                //  Anchor the first one created
                newRect.body.velocity.x = 400;      //  Give it a push :) just for fun
                newRect.body.mass = length / i;     //  Reduce mass for evey rope element
            }

            //  After the first rectangle is created we can add the constraint
            if (lastRect) {
                game.physics.p2.createRevoluteConstraint(newRect, [0, -10], lastRect, [0, 10], maxForce);
            }

            lastRect = newRect;
        }
    }
}
