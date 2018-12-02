// DEPENDENCIES
import { Point } from "phaser-ce";

// CONSTANTS
const LINK_LENGTH = 10;

export default class Chain extends Phaser.Group {

    // CREATORS
    constructor(
        game: Phaser.Game,
        parent: PIXI.DisplayObjectContainer,
        name: string,
        private source: Phaser.Point,
        private sink: Phaser.Point,
    ) {
        super(game, parent, name);
        this.refresh();
    }

    // PUBLIC PROPERTIES
    set sinkPoint(value: Phaser.Point) {
        if (this.sink.x === value.x && this.sink.y === value.y) {
            return;
        }
        this.sink = value;
        this.refresh();
    }

    // PRIVATE METHODS
    private refresh() {
        const x = this.source.x - this.sink.x;
        const y = this.source.y - this.sink.y;
        const w = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        const numLinks = Math.max(2, w / LINK_LENGTH);
        const dx = x / numLinks;
        const dy = y / numLinks;

        for (let i = this.children.length; i < numLinks; ++i) {
            let link: Phaser.Sprite;
            let last: Phaser.Sprite | undefined;
            if (0 === i) {
                link = this.game.add.sprite(
                    this.source.x,
                    this.source.y,
                    "wire",
                    i
                );
            } else {
                last = this.children[this.children.length - 1] as Phaser.Sprite;
                link = this.game.add.sprite(last.x, last.y, "wire", i % 2);
                last.bringToTop();
            }
            this.game.physics.p2.enable(link, false);
            if (last) {
                this.game.physics.p2.createRevoluteConstraint(
                    link,
                    [0, -10],
                    last,
                    [0, 10],
                    20000,
                );
            } else {
                link.body.static = true;
            }
            this.addChild(link);
        }
        //for (let i = this.children.length - 1; numLinks <= i; --i) {
        //    this.removeChildAt(i);
        //}
        for (let i = 0; i < numLinks; ++i) {
            const child = this.children[i] as Phaser.Sprite;
            child.body.mass = numLinks / i;
            child.body.static = false;
        }
        const sinkLink = this.children[numLinks - 1] as Phaser.Sprite;
        sinkLink.body.static = true;
        sinkLink.position.set(this.sink.x, this.sink.y);

        return;
        let lastRect: Phaser.Sprite | undefined;
        for (let i = 0; i < numLinks; ++i) {
            let newRect: Phaser.Sprite;

            const x = dx * i;
            const y = dy * i;

            if (i % 2 === 0) {
                //  Add sprite (and switch frame every 2nd time)
                newRect = this.game.add.sprite(x, y, "wire", 1);
            } else {
                newRect = this.game.add.sprite(x, y, "wire", 0);
                lastRect.bringToTop();
            }

            //  Enable physicsbody
            this.game.physics.p2.enable(newRect, false);

            //  Set custom rectangle
            newRect.body.setRectangle(10, 5);

            if (i === 0) {
                newRect.body.static = true;
            } else {
                //  Anchor the first one created
                newRect.body.velocity.x = 400;
                newRect.body.mass = numLinks / i;
            }

            //  After the first rectangle is created we can add the constraint
            if (lastRect) {
                this.game.physics.p2.createRevoluteConstraint(newRect, [0, -10], lastRect, [0, 10], 20000);
            }

            lastRect = newRect;
        }
        if (lastRect) {
            lastRect.body.static = true;
        }
    }
}
