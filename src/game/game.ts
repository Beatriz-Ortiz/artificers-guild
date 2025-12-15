import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import HubScene from "./scenes/HubScene";

export function createGame(container: HTMLDivElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: "#0b0b0b",
    pixelArt: true,
    roundPixels: true,
    scene: [BootScene, HubScene],

    // FULL SCREEN RESPONSIVE
    scale: {
      mode: Phaser.Scale.RESIZE, // el canvas se adapta al contenedor
      autoCenter: Phaser.Scale.CENTER_BOTH, // centrado automático
    },
  });
}
