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

    this.load.image("tile_grass", "/assets/tiles/tile_grass.png");
    this.load.image("path_straight", "/assets/tiles/tile_path_straight.png");
    this.load.image("path_corner", "/assets/tiles/tile_path_corner.png");
    this.load.image("path_t", "/assets/tiles/tile_path_t.png");
    this.load.image("path_cross", "/assets/tiles/tile_path_cross.png");
    this.load.image("path_end", "/assets/tiles/tile_path_end.png");
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
      "path_straight",
      "path_corner",
      "path_t",
      "path_cross",
      "path_end",
    ].forEach((k) => {
      this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    this.scene.start("HubScene");
  }
}
