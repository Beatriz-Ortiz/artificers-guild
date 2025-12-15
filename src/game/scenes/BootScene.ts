import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("guildhall", "/assets/building_guildhall.png");
    this.load.image("spellbook", "/assets/building_spellbook.png");
    this.load.image("forge", "/assets/building_forge.png");
    this.load.image("portal", "/assets/building_portal.png");
    this.load.image("artificer", "/assets/artificer_idle.png");
    this.load.image("tile_grass", "/assets/tile_grass.png");
  }

  create() {
    // Pixel-perfect: evita blur al escalar
    [
      "guildhall",
      "spellbook",
      "forge",
      "portal",
      "artificer",
      "tile_grass",
    ].forEach((k) => {
      this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    this.scene.start("HubScene");
  }
}
