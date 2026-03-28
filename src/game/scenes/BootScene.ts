import Phaser from "phaser";

const ASSETS = [
  ["guildhall",    "/assets/building_guildhall.png"],
  ["spellbook",    "/assets/building_spellbook.png"],
  ["forge",        "/assets/building_forge.png"],
  ["portal",       "/assets/building_portal.png"],
  ["artificer",    "/assets/artificer_idle.png"],
  ["tile_grass",   "/assets/tiles/tile_grass.png"],
  ["path_straight","/assets/tiles/tile_path_straight.png"],
  ["path_corner",  "/assets/tiles/tile_path_corner.png"],
  ["path_t",       "/assets/tiles/tile_path_t.png"],
  ["path_cross",   "/assets/tiles/tile_path_cross.png"],
  ["path_end",     "/assets/tiles/tile_path_end.png"],
] as const;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    // ── Loading bar ──────────────────────────────────────────────
    const BAR_W = Math.min(280, W * 0.55);
    const BAR_H = 6;
    const BAR_X = cx - BAR_W / 2;
    const BAR_Y = cy + 28;

    // Title
    this.add.text(cx, cy - 18, "Artificer's Guild", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#c9a84c",
    }).setOrigin(0.5);

    // Bar track
    const track = this.add.graphics();
    track.fillStyle(0x2a2d33);
    track.fillRect(BAR_X - 1, BAR_Y - 1, BAR_W + 2, BAR_H + 2);

    // Bar fill
    const fill = this.add.graphics();

    // Percentage text
    const pct = this.add.text(cx, BAR_Y + BAR_H + 12, "0%", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#5a6070",
    }).setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      fill.clear();
      fill.fillStyle(0xc9a84c);
      fill.fillRect(BAR_X, BAR_Y, Math.round(BAR_W * value), BAR_H);
      pct.setText(Math.round(value * 100) + "%");
    });

    this.load.on("complete", () => {
      fill.clear();
      fill.fillStyle(0xc9a84c);
      fill.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
      pct.setText("100%");
    });
    // ─────────────────────────────────────────────────────────────

    for (const [key, path] of ASSETS) {
      this.load.image(key, path);
    }
  }

  create() {
    for (const [key] of ASSETS) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.scene.start("HubScene");
  }
}
