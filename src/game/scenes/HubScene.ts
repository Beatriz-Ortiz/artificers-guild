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

export default class HubScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private player!: Phaser.GameObjects.Image;

  private buildingSprites: Phaser.GameObjects.Image[] = [];
  private buildingLabels: Phaser.GameObjects.Text[] = [];

  private grassBg!: Phaser.GameObjects.TileSprite;

  constructor() {
    super("HubScene");
  }

  create() {
    // --- Config de tamaños deseados en pantalla ---
    const desiredBuildingWidthPx = 180;
    const desiredPlayerWidthPx = 90;
    const labelOffsetY = 18;

    // --- Config del tile (cómo de grande se ve cada “cuadro” de césped) ---
    const desiredGrassTilePx = 32; // prueba 16/24/32/48 según estética

    // Título
    this.titleText = this.add.text(20, 16, "Artificer’s Guild — Hub", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#eaeaea",
    });

    // Fondo de césped (tile repetido)
    this.grassBg = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "tile_grass")
      .setOrigin(0, 0)
      .setDepth(-10);

    // ✅ Escalar el patrón del tile (aunque el PNG sea enorme)
    const applyGrassTileScale = () => {
      const img = this.textures
        .get("tile_grass")
        .getSourceImage() as HTMLImageElement;
      const scale = desiredGrassTilePx / img.width;

      // Phaser TileSprite expone tileScaleX/Y
      (this.grassBg as any).tileScaleX = scale;
      (this.grassBg as any).tileScaleY = scale;
    };

    applyGrassTileScale();

    // Edificios
    BUILDINGS.forEach((b) => {
      const s = this.add.image(0, 0, b.key);

      const buildingScale = desiredBuildingWidthPx / s.width;
      s.setScale(buildingScale);

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
    const playerScale = desiredPlayerWidthPx / this.player.width;
    this.player.setScale(playerScale);
    this.player.setDepth(10);

    // Layout responsive
    const layout = () => {
      const w = this.scale.width;
      const h = this.scale.height;

      this.titleText.setPosition(20, 16);

      // Fondo ocupa pantalla completa
      this.grassBg.setSize(w, h);
      // Reaplicar tileScale por seguridad (si cambias desiredGrassTilePx o el navegador)
      applyGrassTileScale();

      // Personaje abajo izquierda
      this.player.setPosition(w * 0.12, h * 0.82);

      // Edificios y labels
      BUILDINGS.forEach((b, i) => {
        const x = w * b.rx;
        const y = h * b.ry;

        const s = this.buildingSprites[i];
        const label = this.buildingLabels[i];

        s.setPosition(x, y);
        label.setPosition(x, y + s.displayHeight / 2 + labelOffsetY);
      });
    };

    this.scale.on("resize", layout);
    layout();
  }
}
