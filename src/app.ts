import "p2";
import "pixi";

// phaser MUST be imported AFTER p2 and pixi
// tslint:disable-next-line
import "phaser";

import GameOver from "./states/gameover";
import Gameplay from "./states/gameplay";
import Splash from "./states/splash";
import Splash2 from "./states/splash_2";
import Startup from "./states/startup";
import YouWin from "./states/youwin";

class App extends Phaser.Game {
    constructor(config: Phaser.IGameConfig) {
        super(config);

        // tslint:disable-next-line
        console.log("game is starting...");

        this.state.add("startup", Startup);
        this.state.add("splash", Splash);
        this.state.add("splash_2", Splash2);
        this.state.add("gameplay", Gameplay);
        this.state.add("youwin", YouWin);
        this.state.add("gameover", GameOver);

        this.state.start("startup");
    }
}

function startApp(): void {
    const gameWidth: number = 1024;
    const gameHeight: number = 768;

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    const gameConfig: Phaser.IGameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: "",
        resolution: 1,
        scaleMode: Phaser.ScaleManager.SHOW_ALL,
    };

    const app = new App(gameConfig);
    document.getElementById("loading").style.display = "none";
}

document.location.hash = "0";

window.onload = startApp;
