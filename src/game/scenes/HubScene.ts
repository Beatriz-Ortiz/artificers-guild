import Phaser from "phaser";

type BuildingDef = {
  id: "quests" | "skills" | "projects" | "contact";
  key: "guildhall" | "spellbook" | "forge" | "portal";
  label: string;
  rx: number;
  ry: number;
};

const BUILDINGS: BuildingDef[] = [
  { id: "quests", key: "guildhall", label: "Guild Hall", rx: 0.25, ry: 0.42 },
  { id: "skills", key: "spellbook", label: "Spellbook", rx: 0.55, ry: 0.38 },
  { id: "projects", key: "forge", label: "Forge", rx: 0.8, ry: 0.48 },
  { id: "contact", key: "portal", label: "Portal", rx: 0.65, ry: 0.78 },
];

type PathDef = {
  key: "path_straight" | "path_corner" | "path_t" | "path_cross" | "path_end";
  rx: number;
  ry: number;
  rot: 0 | 90 | 180 | 270;
};

export default class HubScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private player!: Phaser.GameObjects.Image;

  private buildingSprites: Phaser.GameObjects.Image[] = [];
  private buildingLabels: Phaser.GameObjects.Text[] = [];

  private grassBg!: Phaser.GameObjects.TileSprite;

  private pathSprites: Phaser.GameObjects.Image[] = [];
  private pathDefs: PathDef[] = [];

  constructor() {
    super("HubScene");
  }

  private snap(v: number, grid: number) {
    return Phaser.Math.Snap.To(v, grid);
  }

  private applyScaleByWidth(
    obj: Phaser.GameObjects.Image,
    desiredWidthPx: number
  ) {
    const scale = desiredWidthPx / obj.width;
    obj.setScale(scale);
  }

  create() {
    // --- Config de tamaños deseados en pantalla ---
    const desiredBuildingWidthPx = 180;
    const desiredPlayerWidthPx = 90;
    const labelOffsetY = 18;

    const desiredPathWidthPx = 48; // tamaño VISUAL del tile de camino
    const grid = desiredPathWidthPx; // rejilla para que encaje

    const desiredGrassTilePx = 32;

    // Título
    this.titleText = this.add.text(20, 16, "Artificer’s Guild — Hub", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#eaeaea",
    });

    // Fondo césped
    this.grassBg = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "tile_grass")
      .setOrigin(0, 0)
      .setDepth(-10);

    const applyGrassTileScale = () => {
      const img = this.textures
        .get("tile_grass")
        .getSourceImage() as HTMLImageElement;
      const scale = desiredGrassTilePx / img.width;
      (this.grassBg as any).tileScaleX = scale;
      (this.grassBg as any).tileScaleY = scale;
    };
    applyGrassTileScale();

    // ===========================
    // DEFINICIÓN DE CAMINOS (RELATIVO)
    // ===========================
    // Importante: los caminos se posicionan en layout() usando rx/ry.
    // Así SIEMPRE se alinean con los edificios.
    this.pathDefs = [
      // Guild Hall -> centro
      { key: "path_end", rx: 0.25, ry: 0.4, rot: 180 },
      { key: "path_straight", rx: 0.25, ry: 0.46, rot: 90 },
      { key: "path_straight", rx: 0.25, ry: 0.52, rot: 90 },

      // Cruce central
      { key: "path_cross", rx: 0.5, ry: 0.52, rot: 0 },

      // Centro -> Spellbook
      { key: "path_straight", rx: 0.5, ry: 0.46, rot: 90 },
      { key: "path_end", rx: 0.5, ry: 0.4, rot: 0 },

      // Centro -> Forge
      { key: "path_straight", rx: 0.56, ry: 0.52, rot: 0 },
      { key: "path_straight", rx: 0.62, ry: 0.52, rot: 0 },
      { key: "path_end", rx: 0.68, ry: 0.52, rot: 0 },

      // Centro -> Portal
      { key: "path_straight", rx: 0.5, ry: 0.58, rot: 90 },
      { key: "path_straight", rx: 0.5, ry: 0.64, rot: 90 },
      { key: "path_end", rx: 0.5, ry: 0.7, rot: 180 },
    ];

    // Crear sprites de camino (una sola vez) y guardarlos
    this.pathDefs.forEach((p) => {
      const s = this.add.image(0, 0, p.key);
      this.applyScaleByWidth(s, desiredPathWidthPx);
      s.setRotation(Phaser.Math.DegToRad(p.rot));
      s.setDepth(-5); // encima césped, debajo edificios
      this.pathSprites.push(s);
    });

    // Edificios
    BUILDINGS.forEach((b) => {
      const s = this.add.image(0, 0, b.key);
      this.applyScaleByWidth(s, desiredBuildingWidthPx);

      s.setInteractive({ useHandCursor: true });
      s.on("pointerdown", () => {
        window.dispatchEvent(
          new CustomEvent("cv:openPanel", { detail: { id: b.id } })
        );
      });
      s.on("pointerover", () => s.setTint(0xffffff));
      s.on("pointerout", () => s.clearTint());

      const label = this.add
        .text(0, 0, b.label, {
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#eaeaea",
        })
        .setOrigin(0.5);

      this.buildingSprites.push(s);
      this.buildingLabels.push(label);
    });

    // Personaje
    this.player = this.add.image(0, 0, "artificer");
    this.applyScaleByWidth(this.player, desiredPlayerWidthPx);
    this.player.setDepth(10);

    // Layout responsive (UNA única fuente de verdad)
    const layout = () => {
      const w = this.scale.width;
      const h = this.scale.height;

      this.titleText.setPosition(20, 16);

      // Fondo
      this.grassBg.setSize(w, h);
      applyGrassTileScale();

      // Caminos (SNAP A GRID aquí)
      this.pathDefs.forEach((p, i) => {
        const x = this.snap(w * p.rx, grid);
        const y = this.snap(h * p.ry, grid);
        this.pathSprites[i].setPosition(Math.round(x), Math.round(y));
      });

      // Personaje
      this.player.setPosition(
        this.snap(w * 0.12, grid),
        this.snap(h * 0.82, grid)
      );

      // Edificios y labels (opcional: también los “snapeo” para más coherencia)
      BUILDINGS.forEach((b, i) => {
        const x = this.snap(w * b.rx, grid);
        const y = this.snap(h * b.ry, grid);

        const s = this.buildingSprites[i];
        const label = this.buildingLabels[i];

        s.setPosition(Math.round(x), Math.round(y));
        label.setPosition(
          Math.round(x),
          Math.round(y + s.displayHeight / 2 + labelOffsetY)
        );
      });
    };

    this.scale.on("resize", layout);
    layout();
  }
}
