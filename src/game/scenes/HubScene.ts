import Phaser from "phaser";

type BuildingDef = {
  id: "quests" | "skills" | "projects" | "contact";
  key: "guildhall" | "spellbook" | "forge" | "portal";
  label: string;
  rx: number;
  ry: number;
};

const BUILDINGS: BuildingDef[] = [
  { id: "quests",   key: "guildhall", label: "Guild Hall", rx: 0.25, ry: 0.42 },
  { id: "skills",   key: "spellbook", label: "Spellbook",  rx: 0.55, ry: 0.38 },
  { id: "projects", key: "forge",     label: "Forge",      rx: 0.8,  ry: 0.48 },
  { id: "contact",  key: "portal",    label: "Portal",     rx: 0.65, ry: 0.78 },
];

type PathDef = {
  key: "path_straight" | "path_corner" | "path_t" | "path_cross" | "path_end";
  rx: number;
  ry: number;
  rot: 0 | 90 | 180 | 270;
};

export default class HubScene extends Phaser.Scene {
  private buildingSprites: Phaser.GameObjects.Image[] = [];
  private buildingLabels:  Phaser.GameObjects.Text[]  = [];
  private grassBg!: Phaser.GameObjects.TileSprite;
  private pathSprites: Phaser.GameObjects.Image[] = [];
  private pathDefs: PathDef[] = [];
  private player!: Phaser.GameObjects.Image;
  private focusListener!: (e: Event) => void;

  // Gameplay state
  private mimicIdx: number = -1; // index of the building that is currently a mimic, -1 = none

  constructor() {
    super("HubScene");
  }

  private snap(v: number, grid: number) {
    return Phaser.Math.Snap.To(v, grid);
  }

  private applyScaleByWidth(obj: Phaser.GameObjects.Image, desiredWidthPx: number) {
    obj.setScale(desiredWidthPx / obj.width);
  }

  private faceBuilding(buildingId: string | null) {
    if (!buildingId) return;
    const def = BUILDINGS.find((b) => b.id === buildingId);
    if (!def) return;
    const buildingX = this.scale.width * def.rx;
    const playerX   = this.player.x;
    this.player.setFlipX(buildingX < playerX);
  }

  /** Handle a building click — checks for mimic before dispatching panel open. */
  private handleBuildingClick(idx: number, id: string) {
    if (this.mimicIdx === idx) {
      this.triggerMimic(idx, id);
    } else {
      window.dispatchEvent(new CustomEvent("cv:openPanel", { detail: { id } }));
    }
  }

  /** Triggered when the player clicks the disguised mimic building. */
  private triggerMimic(idx: number, id: string) {
    const sprite = this.buildingSprites[idx];
    const label  = this.buildingLabels[idx];

    // Stop the wobble and straighten up
    this.tweens.killTweensOf(sprite);
    sprite.setAngle(0);

    // Camera shock: shake + delayed red flash
    this.cameras.main.shake(400, 0.015);
    this.time.delayedCall(80, () => {
      this.cameras.main.flash(250, 200, 0, 0);
    });

    // Show reveal label
    label.setText("👹 MIMIC!");
    label.setColor("#ff4444");

    // Notify React (toast)
    window.dispatchEvent(new CustomEvent("cv:mimicRevealed"));

    // After the drama, open the real panel
    this.time.delayedCall(1400, () => {
      this.mimicIdx = -1;
      label.setText(BUILDINGS[idx].label);
      label.setColor("#eaeaea");
      window.dispatchEvent(new CustomEvent("cv:openPanel", { detail: { id } }));
    });
  }

  /** Randomly turns one building into a mimic. Called once at 90s. */
  private activateMimic() {
    const idx    = Phaser.Math.Between(0, BUILDINGS.length - 1);
    this.mimicIdx = idx;

    const sprite = this.buildingSprites[idx];
    const label  = this.buildingLabels[idx];

    // Subtle angle wobble
    this.tweens.add({
      targets:  sprite,
      angle:    { from: -3, to: 3 },
      duration: 220,
      yoyo:     true,
      repeat:   -1,
      ease:     "Sine.easeInOut",
    });

    label.setText("📦 ???");
    label.setColor("#ffaa00");

    // Auto-restore after 3 minutes if the player never investigates
    this.time.addEvent({
      delay:         180_000,
      callbackScope: this,
      callback: () => {
        if (this.mimicIdx !== idx) return; // already triggered
        this.tweens.killTweensOf(sprite);
        sprite.setAngle(0);
        label.setText(BUILDINGS[idx].label);
        label.setColor("#eaeaea");
        this.mimicIdx = -1;
      },
    });
  }

  /** Spawns a goblin emoji that runs across the bottom of the screen. */
  private spawnGoblin() {
    const w = this.scale.width;
    const h = this.scale.height;

    const goRight = Phaser.Math.Between(0, 1) === 0;
    const startX  = goRight ? -55 : w + 55;
    const endX    = goRight ? w + 55 : -55;
    const y = h * 0.65 + Phaser.Math.Between(0, Math.round(h * 0.1));

    const goblin = this.add.text(startX, y, "👺", {
      fontSize: "30px",
    }).setDepth(15);

    goblin.setInteractive({ useHandCursor: true });

    // Schedule the next goblin regardless of whether this one is caught
    const scheduleNext = () => {
      this.time.addEvent({
        delay:         Phaser.Math.Between(50_000, 90_000),
        callback:      this.spawnGoblin,
        callbackScope: this,
      });
    };

    const tween = this.tweens.add({
      targets:  goblin,
      x:        endX,
      duration: Phaser.Math.Between(2600, 3600),
      ease:     "Linear",
      onComplete: () => {
        if (goblin.active) goblin.destroy();
        scheduleNext();
      },
    });

    goblin.on("pointerdown", () => {
      tween.stop();
      // Float up and fade out on catch
      this.tweens.add({
        targets:  goblin,
        y:        goblin.y - 28,
        alpha:    0,
        duration: 380,
        ease:     "Power2",
        onComplete: () => {
          if (goblin.active) goblin.destroy();
          scheduleNext();
        },
      });
      window.dispatchEvent(new CustomEvent("cv:goblinCaught"));
    });
  }

  create() {
    const desiredBuildingWidthPx = 180;
    const desiredPlayerWidthPx   = 90;
    const labelOffsetY           = 18;
    const desiredPathWidthPx     = 48;
    const grid                   = desiredPathWidthPx;
    const desiredGrassTilePx     = 32;

    // Grass background
    this.grassBg = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "tile_grass")
      .setOrigin(0, 0)
      .setDepth(-10);

    const applyGrassTileScale = () => {
      const img = this.textures.get("tile_grass").getSourceImage() as HTMLImageElement;
      const scale = desiredGrassTilePx / img.width;
      (this.grassBg as unknown as { tileScaleX: number; tileScaleY: number }).tileScaleX = scale;
      (this.grassBg as unknown as { tileScaleX: number; tileScaleY: number }).tileScaleY = scale;
    };
    applyGrassTileScale();

    // Path definitions
    this.pathDefs = [
      { key: "path_end",      rx: 0.25, ry: 0.40, rot: 180 },
      { key: "path_straight", rx: 0.25, ry: 0.46, rot: 90  },
      { key: "path_straight", rx: 0.25, ry: 0.52, rot: 90  },
      { key: "path_cross",    rx: 0.5,  ry: 0.52, rot: 0   },
      { key: "path_straight", rx: 0.5,  ry: 0.46, rot: 90  },
      { key: "path_end",      rx: 0.5,  ry: 0.40, rot: 0   },
      { key: "path_straight", rx: 0.56, ry: 0.52, rot: 0   },
      { key: "path_straight", rx: 0.62, ry: 0.52, rot: 0   },
      { key: "path_end",      rx: 0.68, ry: 0.52, rot: 0   },
      { key: "path_straight", rx: 0.5,  ry: 0.58, rot: 90  },
      { key: "path_straight", rx: 0.5,  ry: 0.64, rot: 90  },
      { key: "path_end",      rx: 0.5,  ry: 0.70, rot: 180 },
    ];

    this.pathDefs.forEach((p) => {
      const s = this.add.image(0, 0, p.key);
      this.applyScaleByWidth(s, desiredPathWidthPx);
      s.setRotation(Phaser.Math.DegToRad(p.rot));
      s.setDepth(-5);
      this.pathSprites.push(s);
    });

    // Buildings
    BUILDINGS.forEach((b, idx) => {
      const s = this.add.image(0, 0, b.key);
      this.applyScaleByWidth(s, desiredBuildingWidthPx);

      s.setInteractive({ useHandCursor: true });
      s.on("pointerdown", () => this.handleBuildingClick(idx, b.id));
      s.on("pointerover", () => s.setTint(0xffd700));
      s.on("pointerout",  () => s.clearTint());

      const label = this.add
        .text(0, 0, b.label, {
          fontFamily:      "monospace",
          fontSize:        "14px",
          color:           "#eaeaea",
          stroke:          "#0b0b0b",
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      this.buildingSprites.push(s);
      this.buildingLabels.push(label);
    });

    // Player character
    this.player = this.add.image(0, 0, "artificer");
    this.applyScaleByWidth(this.player, desiredPlayerWidthPx);
    this.player.setDepth(10);

    // Listen for React → Phaser facing updates
    this.focusListener = (e: Event) => {
      const { building } = (e as CustomEvent<{ building: string | null }>).detail;
      this.faceBuilding(building);
    };
    window.addEventListener("cv:buildingFocus", this.focusListener);

    // Responsive layout
    const layout = () => {
      const w = this.scale.width;
      const h = this.scale.height;

      this.grassBg.setSize(w, h);
      applyGrassTileScale();

      this.pathDefs.forEach((p, i) => {
        const x = this.snap(w * p.rx, grid);
        const y = this.snap(h * p.ry, grid);
        this.pathSprites[i].setPosition(Math.round(x), Math.round(y));
      });

      this.player.setPosition(
        this.snap(w * 0.12, grid),
        this.snap(h * 0.82, grid)
      );

      BUILDINGS.forEach((b, i) => {
        const x = this.snap(w * b.rx, grid);
        const y = this.snap(h * b.ry, grid);
        const s = this.buildingSprites[i];
        const lbl = this.buildingLabels[i];
        s.setPosition(Math.round(x), Math.round(y));
        lbl.setPosition(
          Math.round(x),
          Math.round(y + s.displayHeight / 2 + labelOffsetY)
        );
      });
    };

    this.scale.on("resize", layout);
    layout();

    // ── Gameplay timers ──────────────────────────────────────
    // First goblin at 30s, subsequent ones chain-scheduled inside spawnGoblin()
    this.time.addEvent({
      delay:         30_000,
      callback:      this.spawnGoblin,
      callbackScope: this,
    });

    // One-shot mimic at 90s
    this.time.addEvent({
      delay:         90_000,
      callback:      this.activateMimic,
      callbackScope: this,
    });
  }

  shutdown() {
    window.removeEventListener("cv:buildingFocus", this.focusListener);
    // Kill any active mimic wobble tweens
    this.buildingSprites.forEach((s) => this.tweens.killTweensOf(s));
  }
}
