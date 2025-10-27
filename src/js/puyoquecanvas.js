/* eslint-disable */
import * as PIXI from "pixi.js";
import { PuyoqueStd } from "@/js/puyoquestd.js";
import Point from "@/js/point.js";
import Route from "@/js/route.js";

const backgroundColor = 0xc8c8c8;
const backgroundColorForEditMode = 0x224422;
const plusSvgPath = "img/plus.svg";

export default class PuyoqueCanvas {
  static origPuyoWidth = 97;
  static origPuyoHeight = 89;
  static origNextWidth = 100;
  static origNextHeight = 100;

  static imgNames = [
    "red.png",
    "blue.png",
    "yellow.png",
    "green.png",
    "purple.png",
    "heart.png",
    "prism.png",
    "ojama.png",
    "katapuyo.png",
    "next-red.png",
    "next-blue.png",
    "next-yellow.png",
    "next-green.png",
    "next-purple.png",
  ];

  /**
   *
   * @param {string} resourceDir リソースのあるディレクトリ
   */
  constructor(resourceDir) {
    this.resourceDir = resourceDir;
  }
  async init(selecter, canvasWidth, canvasHeigth, field) {
    this.canvasWidth = canvasWidth;
    this.canvasHeigth = canvasHeigth;
    this.field = field;

    this.app = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeigth,
      backgroundColor: backgroundColor,
      autoResize: true,
    });

    document.querySelector(selecter).appendChild(this.app.view);
    this.initContainers();
    this.puyoTextures = [];
    this.puyoSprites = [];
    this.plusSprites = [];
    this.selectedPaintSprites = [];
    this.floatingPuyoSprites = [];
    this.nextPuyoSprites = [];
    this.nextPlusSprites = [];
    this.paintColor = -1;
    this.editPaintColor = -1;
    this.selectMode = "selectRouteDelete";
    this.selectRoute = new Route();
    this.selectedField = [];
    this.selectRouteLengthMax = 5;
    /**
     * callback
     */
    this.passSelectRouteLengthMax = function () {
      //return vm.selectRouteLengthMax;
      return this.selectRouteLengthMax;
    };
    this.erasePuyoLength = 4;

    this.puyoWidth = 0;
    this.puyoHeight = 0;
    this.nextHeight = 0;
    this.puyoScale = 1;

    this.isPush = false;
    this.isChain = false; // 連鎖中かのフラグ
    this.chainNum = 0;

    this.atackColor = 0;
    this.selectRouteListeners = [];
    this.chainStartListeners = [];
    this.chainListeners = [];
    this.allClearListeners = [];
    this.chainEndListeners = [];

    /**
     * 外部クラスに連鎖情報を渡すコールバック
     * @param {number} deletePuyoNum
     * @param {number} deleteColorList
     * @param {number} deletePrismNum
     * @param {number} chainNum
     */
    this.calcColorMag = function (
      deletePuyoNum,
      deleteColorList,
      deletePrismNum,
      chainNum
    ) {};

    this.dropSpeed = 5;
    this.chainWait = 2;

    const rd = this.resourceDir;
    await PIXI.Assets.load([rd + "img/puyos.json", rd + plusSvgPath]).then(
      () => {
        this.onAssetsLoaded();
      }
    );
  }

  initContainers() {
    this.container = new PIXI.Container();
    this.puyoContainer = new PIXI.Container();
    this.puyoContainers = [];
    this.fieldContainer = new PIXI.Container();
    this.selectedPuyoContainer = new PIXI.Container();
    this.touchContainer = new PIXI.Container();
    this.selectGraph = new PIXI.Graphics();
  }

  /**
   *
   * @param {"selectRouteDelete" | "selectRoutePaint"| "editer"} mode
   */
  setSelectMode(mode) {
    this.selectMode = mode;
  }

  setAtackColor(color) {
    this.atackColor = color;
  }

  setErasePuyoLength(num) {
    this.erasePuyoLength = num;
  }

  array2dInit(width, height, value) {
    var array = [];

    for (var y = 0; y < height; y++) {
      array[y] = [];
      for (var x = 0; x < width; x++) {
        array[y][x] = value;
      }
    }
    return array;
  }

  resetSelect() {
    this.selectedField = this.array2dInit(
      this.field.width,
      this.field.height,
      false
    );
    /*
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        let puyo = this.getPuyoSprite(x, y);
      }
    }
      */
    this.selectRoute = new Route();
  }

  calcPuyoRect() {
    let squareWidth = this.canvasWidth / this.field.width;
    let puyoScale = squareWidth / PuyoqueCanvas.origPuyoWidth;
    this.puyoScale = puyoScale;

    this.puyoWidth = PuyoqueCanvas.origPuyoWidth * puyoScale;
    this.puyoHeight = PuyoqueCanvas.origPuyoHeight * puyoScale;

    let nextFieldHeight =
      this.canvasHeigth - this.puyoHeight * this.field.height;
    let nextScale = nextFieldHeight / PuyoqueCanvas.origNextHeight;
    this.nextScale = nextScale;
    this.nextWidth = PuyoqueCanvas.origNextWidth * nextScale;
    this.nextHeight = PuyoqueCanvas.origNextHeight * nextScale;
  }

  initBoostAreaSprites() {
    this.boostAreaContainer = new PIXI.Container();

    let boostAreaSprites = [];
    for (let y = 0; y < this.field.height; y++) {
      let lineSprites = [];
      for (let x = 0; x < this.field.width; x++) {
        const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        sprite.tint = 0xffffe0;
        sprite.x = this.puyoWidth * x;
        sprite.y = this.puyoHeight * y + this.nextHeight;
        sprite.width = this.puyoWidth;
        sprite.height = this.puyoHeight;

        lineSprites.push(sprite);
        this.boostAreaContainer.addChild(sprite);
      }
      boostAreaSprites.push(lineSprites);
    }
    this.boostAreaSprites = boostAreaSprites;
  }

  initPuyoContainers() {
    this.puyoContainers = [];
    for (let y = 0; y < this.field.height; y++) {
      let lineContainers = [];
      for (let x = 0; x < this.field.width; x++) {
        let container = new PIXI.Container();
        container.x = this.puyoWidth * x;
        container.y = this.puyoHeight * y + this.nextHeight;

        let hitAreaScale = 0.6;
        let width = this.puyoWidth * hitAreaScale;
        let height = this.puyoHeight * hitAreaScale;
        let hitX = (this.puyoWidth - width) / 2;
        let hitY = (this.puyoHeight - height) / 2;
        container.eventMode = "static";

        /*
            container.hitArea = new PIXI.Rectangle(
          container.x + hitX,
          container.y + hitY,
          width,
          height
        );      
         */
        container.hitArea = new PIXI.Rectangle(hitX, hitY, width, height);

        lineContainers.push(container);
        this.fieldContainer.addChild(container);
      }
      this.puyoContainers.push(lineContainers);
    }
  }
  initPuyoSprites() {
    const puyoScale = this.puyoScale;

    for (let y = 0; y < this.field.height; y++) {
      let lineSprites = [];
      for (let x = 0; x < this.field.width; x++) {
        let sprite = new PIXI.Sprite(this.puyoTextures[0]);
        sprite.scale.x = puyoScale;
        sprite.scale.y = puyoScale;
        //sprite.x = this.puyoWidth * x;
        //sprite.y = this.puyoHeight * y + this.nextHeight;
        sprite.x = 0;
        sprite.y = 0;

        // sprite.eventMode = "static";
        //sprite.cursor = "pointer";

        const c = this.puyoContainers[y][x];
        let hitAreaScale = 0.5;
        let width = sprite.width * hitAreaScale;
        let height = sprite.height * hitAreaScale;
        let hitX = (sprite.width - width) / 2;
        let hitY = (sprite.height - height) / 2;
        sprite.hitArea = new PIXI.Rectangle(
          c.x + sprite.x + hitX,
          c.y + sprite.y + hitY,
          width,
          height
        );

        lineSprites.push(sprite);
        this.puyoContainers[y][x].addChild(sprite);
        //this.puyoContainer.addChild(sprite);
      }

      this.puyoSprites.push(lineSprites);
    }
  }
  initPlusSprites() {
    const puyoScale = this.puyoScale;
    const puyoSize = PuyoqueCanvas.origPuyoWidth * puyoScale;
    const plusSize = puyoSize * 0.4;

    this.plusSprites = [];
    for (let y = 0; y < this.field.height; y++) {
      let lineSprites = [];
      for (let x = 0; x < this.field.width; x++) {
        let sprite = new PIXI.Sprite(PIXI.Texture.from(plusSvgPath));
        sprite.width = plusSize;
        sprite.height = plusSize;
        sprite.x = this.puyoWidth * 0.5;
        sprite.y = this.puyoHeight * 0.5;

        lineSprites.push(sprite);
        this.puyoContainers[y][x].addChild(sprite);
      }

      this.plusSprites.push(lineSprites);
    }
  }

  initNextPuyoPlusSprites() {
    const nextScale = this.nextScale;
    const nextSize = PuyoqueCanvas.origNextWidth * nextScale;
    const plusSize = nextSize * 0.6;

    this.nextPlusSprites = [];

    for (let x = 0; x < this.field.width; x++) {
      let sprite = new PIXI.Sprite(PIXI.Texture.from(plusSvgPath));
      sprite.width = plusSize;
      sprite.height = plusSize;
      const nx = this.nextPuyoSprites[x].x;
      sprite.x = nx + this.nextWidth * 0.4;
      sprite.y = this.nextHeight * 0.4;

      this.nextPlusSprites.push(sprite);
      this.fieldContainer.addChild(sprite);
    }
  }

  initNextPuyoSprites() {
    let squareWidth = this.canvasWidth / this.field.width;
    let nextFieldHeight =
      this.canvasHeigth - this.puyoHeight * this.field.height;

    let nextScale = nextFieldHeight / PuyoqueCanvas.origNextHeight;
    let nextWidth = PuyoqueCanvas.origNextWidth * nextScale;
    let nextCenter = (squareWidth - nextWidth) / 2;

    if (nextFieldHeight > 0) {
      for (let x = 0; x < this.field.width; x++) {
        let sprite = new PIXI.Sprite(
          this.puyoTextures[this.field.getNextColor(x) + 9]
        );
        sprite.scale.x = nextScale;
        sprite.scale.y = nextScale;
        sprite.x = squareWidth * x + nextCenter;
        sprite.y = 0;

        sprite.hitArea = new PIXI.Rectangle(
          sprite.x,
          sprite.y,
          sprite.width,
          sprite.height
        );

        this.nextPuyoSprites.push(sprite);
        this.fieldContainer.addChild(sprite);
      }
    }
  }

  initTouchContainer() {
    this.touchContainer.x = 0;
    this.touchContainer.y = 0;
    this.touchContainer.width = this.canvasWidth;
    this.touchContainer.height = this.canvasWidth;
    this.touchContainer.hitArea = this.app.screen;
    this.touchContainer.eventMode = "static";
    this.touchContainer.cursor = "pointer";
    this.touchContainer
      .on("pointerdown", this.pointerDown.bind(this))
      .on("pointermove", this.pointerMove.bind(this))
      .on("pointerup", this.pointerUp.bind(this))
      .on("pointerout", this.pointerLeave.bind(this));
  }

  initselectedPuyoContainer() {
    const puyoScale = this.puyoScale;

    for (let y = 0; y < this.field.height; y++) {
      let lineSprites = [];
      for (let x = 0; x < this.field.width; x++) {
        let sprite = new PIXI.Sprite();
        sprite.scale.x = puyoScale;
        sprite.scale.y = puyoScale;
        sprite.x = this.puyoWidth * x;
        sprite.y = this.puyoHeight * y + this.nextHeight;

        lineSprites.push(sprite);
        this.selectedPuyoContainer.addChild(sprite);
      }

      this.selectedPaintSprites.push(lineSprites);
    }
  }

  onAssetsLoaded() {
    for (const name of PuyoqueCanvas.imgNames) {
      this.puyoTextures.push(PIXI.Texture.from(name));
    }

    this.calcPuyoRect();
    this.initBoostAreaSprites();
    this.initPuyoContainers();
    this.initPuyoSprites();
    this.initPlusSprites();
    this.initNextPuyoSprites();
    this.initNextPuyoPlusSprites();
    this.initselectedPuyoContainer();
    this.initTouchContainer();

    this.container.addChild(
      this.boostAreaContainer,
      this.fieldContainer,
      this.selectedPuyoContainer,
      this.selectGraph
    );
    this.app.stage.addChild(this.container, this.touchContainer);
    this.app.ticker.add((delta) => {
      this.animate(delta);
    });

    this.resetSelect();
  }

  pointerDown(event) {
    if (this.isChain) return;
    this.isPush = true;
    this.selectRoute = new Route();
    this.selectRouteLengthMax = this.passSelectRouteLengthMax();
  }

  pointerLeave(event) {
    this.isPush = false;
    this.eraseSelectedPaintPuyo();
    this.resetSelect();
  }

  pointerMove(event) {
    if (!this.isPush) return;

    const point = event.data.getLocalPosition(this.container);

    this.editPaint(point);

    if (this.selectRoute.length >= this.selectRouteLengthMax) return;

    let fp = this.toFieldPoint(point.x, point.y);
    if (!fp) return;
    if (this.editPaintColor > -1) return;

    /** select route */
    if (this.isSelected(fp.x, fp.y)) return console.log("isSelected");
    if (this.field.isBlank(fp.x, fp.y)) return console.log("field.isBlank");
    if (!this.field.canTracePuyo(fp.x, fp.y))
      return console.log("field.canTracePuyo");
    // 現在なぞろうとしているぷよの周囲のぷよが選択されていない
    if (this.selectRoute.length > 0 && !this.isAdjacentSelected(fp.x, fp.y))
      return console.log("!isAdjacentSelected");

    //let puyo = this.getPuyoSprite(fp.x, fp.y);
    this.selectRoute.push(fp);
    this.select(fp.x, fp.y);
    for (const func of this.selectRouteListeners) {
      func(this.selectRoute.clone());
    }
  }

  editPaint(cursorPoint) {
    if (this.editPaintColor === -1) return;
    this.editPaintPuyo(cursorPoint);
    this.editPaintNextPuyo(cursorPoint);
  }

  editPaintPuyo(cursorPoint) {
    let fp = this.toFieldPoint(cursorPoint.x, cursorPoint.y);
    if (!fp) return;
    if (this.editPaintColor === 999) {
      this.field.deletePuyo(fp.x, fp.y);
      return;
    }
    this.field.setPuyo(fp.x, fp.y, this.editPaintColor);
  }

  editPaintNextPuyo(cursorPoint) {
    let x = this.toNextPuyoPoint(cursorPoint.x, cursorPoint.y);

    if (x === -1) return;
    if (this.editPaintColor === 999) {
      this.field.deleteNext(x);
      return;
    }
    this.field.setNextColor(x, this.editPaintColor);
  }

  pointerUp(event) {
    if (!this.isPush) return;

    this.isPush = false;
    this.fire();
  }

  fire() {
    if (this.selectRoute.length > 0) {
      if (!this.field.canTraceRoute(this.selectRoute.points)) return;
      this.chainStart();
    }
    this.resetSelect();
  }

  /**
   * 浮遊ぷよがすべて接地したかチェック
   * @returns {boolean}
   */
  isAllLanding() {
    for (const puyo of this.floatingPuyoSprites) {
      if (puyo.distance > 0) return false;
    }
    return true;
  }

  /**
   * 浮遊しているぷよをフィールドに反映させる
   * おそらく使わない
   */
  landing() {
    for (const puyo of this.floatingPuyoSprites) {
      let x = puyo.landingX;
      let y = puyo.landingY;
      puyo.destroy();
    }
    this.floatingPuyoSprites = [];
    if (this.field.getFloatingPuyo().length > 0) {
      this.field.dropFloatingPuyo();
    } else {
      this.field.dropFloatingNext();
    }
  }

  addSelectRouteListeners(func) {
    this.selectRouteListeners.push(func);
  }
  addChainStartListener(func) {
    this.chainStartListeners.push(func);
  }
  addChainListener(func) {
    this.chainListeners.push(func);
  }
  addChainEndListener(func) {
    this.chainEndListeners.push(func);
  }
  addAllClearListener(func) {
    this.allClearListeners.push(func);
  }

  chainStart() {
    for (const func of this.chainStartListeners) {
      func(this.selectRoute.clone());
    }

    this.isChain = true;
    this.chainNum = 0;
    this.deleteBoostAreaTotalCount = 0;

    if (this.paintColor === -1) this.deleteSelectPuyo();
    else {
      this.paintSelectPuyo();
      this.eraseSelectedPaintPuyo();
      this.chain();
      this.selectRoute = new Route();
      return;
    }
    this.selectRoute = new Route();

    this.setFloatingPuyo();
    this.field.holdFloatingPuyo();
    this.field.deleteFoatingPuyo();
    if (this.floatingPuyoSprites.length > 0) return;

    this.setFloatingNext();
    this.field.holdFoatingNexts();
    this.field.deleteFoatingNextNext();
    if (this.floatingPuyoSprites.length > 0) return;

    this.chainEnd();
  }
  chainEnd() {
    this.isChain = false;

    for (const func of this.chainEndListeners) {
      func(this.chainNum, this.deleteBoostAreaTotalCount);
    }
  }

  chain() {
    this.field.dropHoldFoatingPuyo();
    this.deleteFloatingPuyoSprites();

    for (const func of this.chainListeners) {
      func();
    }

    let puyoColor = PuyoqueStd.puyoColor;
    let targetLength = this.erasePuyoLength;
    let chained = false;

    let deleteHeartNum = 0;
    let deletePrismNum = 0;
    let deletePuyoNum = 0;
    let deleteBoostAreaCount = 0;

    let deleteColorList = [];

    this.field.searchLinkPuyos(targetLength, (points, color) => {
      chained = true;
      deleteBoostAreaCount = 0;
      for (const point of points) {
        this.field.targetAround(point.x, point.y, (x, y, color) => {
          if (color === puyoColor.heart) {
            deleteHeartNum++;
            if (this.field.isBoostArea(x, y)) deleteBoostAreaCount++;
            this.field.deletePuyo(x, y);
          } else if (color === puyoColor.prism) {
            deletePuyoNum++;
            deletePrismNum++;
            if (this.field.isBoostArea(x, y)) deleteBoostAreaCount++;
            this.field.deletePuyo(x, y);
          } else if (color === puyoColor.ojama) {
            deletePuyoNum++;
            if (this.field.isBoostArea(x, y)) deleteBoostAreaCount++;
            this.field.deletePuyo(x, y);
          } else if (color === puyoColor.kataPuyo) {
            this.field.setColor(x, y, puyoColor.ojamaChanging);
          }
        });
        if (this.field.isBoostArea(point.x, point.y)) deleteBoostAreaCount++;
      }
      deleteColorList.push(color);
      const plusCount = this.field.countPointsToPlus(points);
      deletePuyoNum += points.length + plusCount;
      this.field.deletePuyos(points);
      this.deleteBoostAreaTotalCount += deleteBoostAreaCount;
    });
    this.ojamaChangingToOjama();

    if (chained) {
      this.calcColorMag(
        deletePuyoNum,
        deleteColorList,
        deletePrismNum,
        this.chainNum
      );
      this.chainNum++;
      this.setFloatingPuyo();
      this.field.holdFloatingPuyo();
      this.field.deleteFoatingPuyo();
      if (this.floatingPuyoSprites.length === 0) {
        // 落下中のぷよがなくなった

        if (this.field.isAllClear()) {
          // 全消しであった場合
          for (const func of this.allClearListeners) {
            // 全消しリスナーを呼び出す
            func();
          }
        }
        // ネクストぷよを落とす
        this.setFloatingNext();
        this.field.holdFoatingNextNext();
        this.field.deleteFoatingNextNext();
      }
    } else {
      if (this.field.isAllClear()) {
        // 全消しであった場合
        for (const func of this.allClearListeners) {
          // 全消しリスナーを呼び出す
          func();
        }
      }

      // ネクストぷよを落とす
      this.setFloatingNext();
      this.field.holdFoatingNextNext();
      this.field.deleteFoatingNextNext();
    }

    if (this.floatingPuyoSprites.length === 0) {
      this.chainEnd();
    }
  }

  /**
   * 連鎖に巻き込まれた状態の固ぷよ(c.ojamaChanging)があればおじゃまぷよに変換する
   * 1連鎖の終わりごとに呼び出される
   */
  ojamaChangingToOjama() {
    const field = this.field;
    const c = PuyoqueStd.puyoColor;
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (field.colorComp(x, y, c.ojamaChanging)) {
          field.setColor(x, y, c.ojama);
        }
      }
    }
  }

  setFloatingPuyo() {
    let puyos = this.field.getFloatingPuyo();

    if (puyos.length === 0) {
      return;
    }

    for (const puyo of puyos) {
      let floatingPuyo = new PIXI.Sprite(this.puyoTextures[puyo.color]);
      floatingPuyo.puyoColor = puyo.color;
      floatingPuyo.puyoChance = puyo.chance;

      floatingPuyo.scale.x = this.puyoScale;
      floatingPuyo.scale.y = this.puyoScale;
      floatingPuyo.x = this.puyoWidth * puyo.x;
      floatingPuyo.y = this.puyoHeight * puyo.y + this.nextHeight;
      floatingPuyo.landingX = puyo.x;
      floatingPuyo.landingY = puyo.y + puyo.dropStep;
      floatingPuyo.distance = this.puyoHeight * puyo.dropStep;
      this.container.addChild(floatingPuyo);
      this.floatingPuyoSprites.push(floatingPuyo);
    }
  }

  setFloatingNext() {
    let puyos = this.field.getFloatingNextNext();
    if (puyos.length === 0) {
      return;
    }
    for (const puyo of puyos) {
      let floatingPuyo = new PIXI.Sprite(this.puyoTextures[puyo.color]);
      floatingPuyo.puyoColor = puyo.color;
      floatingPuyo.puyoChance = puyo.chance;

      floatingPuyo.scale.x = this.puyoScale;
      floatingPuyo.scale.y = this.puyoScale;
      floatingPuyo.x = this.puyoWidth * puyo.x;
      floatingPuyo.y = this.puyoHeight * puyo.y;
      floatingPuyo.landingX = puyo.x;
      floatingPuyo.landingY = puyo.dropStep - 1;
      floatingPuyo.distance = this.puyoHeight * puyo.dropStep + this.nextHeight;
      this.container.addChild(floatingPuyo);
      this.floatingPuyoSprites.push(floatingPuyo);
    }
  }

  deleteFloatingPuyoSprites() {
    for (let sprite of this.floatingPuyoSprites) {
      sprite.destroy();
    }
    this.floatingPuyoSprites = [];
  }

  drawFloatingPuyo() {
    for (const puyo of this.floatingPuyoSprites) {
      if (puyo.distance <= 0) continue;
      puyo.y += this.dropSpeed;
      puyo.distance -= this.dropSpeed;
      if (puyo.distance <= 0) {
        puyo.y += puyo.distance;
        puyo.distance = 0;
      }
    }
  }

  drawBoostArea() {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        this.boostAreaSprites[y][x].visible = this.field.isBoostArea(x, y);
      }
    }
  }

  drawField() {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        if (this.field.isBlank(x, y)) {
          this.setInvisiblePuyo(x, y);
        } else {
          let color = this.field.getColor(x, y);
          this.setPuyoColor(x, y, color);
          this.setVisiblePuyo(x, y);
          this.plusSprites[y][x].visible = this.field.getPlus(x, y);
        }
      }
    }

    for (let x = 0; x < this.field.width; x++) {
      if (this.field.isNextBlank(x)) {
        this.setInvisibleNext(x);
      } else {
        let color = this.field.getNextColor(x);
        this.setNextPuyoColor(x, color);
        this.setVisibleNext(x);
        this.nextPlusSprites[x].visible = this.field.getNextPlus(x);
      }
    }
  }
  /*
    drawSelect() {
        this.selectGraph.clear();
        this.selectGraph.beginFill(0x000000);
        this.selectGraph.alpha = 0.5;
        for (let y = 0; y < this.field.height; y++) {
            for (let x = 0; x < this.field.width; x++) {
                if (!this.isSelected(x, y)) continue;
                this.selectGraph.drawRect(x * this.puyoWidth, y * this.puyoHeight + this.nextHeight, this.puyoWidth, this.puyoHeight);
            }
        }
        this.selectGraph.endFill();
    }
    */

  drawSelect() {
    if (this.editPaintColor > -1) return;

    this.selectGraph.clear();
    this.selectGraph.beginFill(0x000000);
    this.selectGraph.alpha = 0.5;
    for (const p of this.selectRoute.points) {
      this.selectGraph.drawRect(
        p.x * this.puyoWidth,
        p.y * this.puyoHeight + this.nextHeight,
        this.puyoWidth,
        this.puyoHeight
      );
    }

    this.selectGraph.endFill();
  }

  drawSelectedPaintPuyo() {
    for (const p of this.selectRoute.points) {
      this.selectedPaintSprites[p.y][p.x].texture =
        this.puyoTextures[this.paintColor];
    }
  }

  eraseSelectedPaintPuyo() {
    for (const p of this.selectRoute.points) {
      this.selectedPaintSprites[p.y][p.x].texture = null;
    }
  }

  animate(delta) {
    //浮遊しているぷよが合ってなおかつ全て接地していた場合のみ
    if (this.floatingPuyoSprites.length > 0 && this.isAllLanding()) {
      this.chain();
    }
    this.drawSelect();
    this.drawSelectedPaintPuyo();
    this.drawBoostArea();
    this.drawField();
    this.drawFloatingPuyo();
  }

  isRangeCanvas(x, y) {
    return 0 <= x && x < this.canvasWidth && 0 <= y && y < this.canvasHeigth;
  }

  /**
   * 指定座標がぷよスプライト上であればそのフィールド座標を返す
   * @param {number} canvasX
   * @param {number} canvasY
   * @returns {Point | undefined} フィールド上の座標
   */
  toFieldPoint(canvasX, canvasY) {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        let puyo = this.getPuyoSprite(x, y);

        //let puyo = this.getPuyoContainer(x, y);
        if (puyo && puyo.hitArea.contains(canvasX, canvasY)) {
          return new Point(x, y);
        }
      }
    }
    return null;
  }

  toNextPuyoPoint(canvasX, canvasY) {
    for (let x = 0; x < this.field.width; x++) {
      let puyo = this.getNextPuyoSprite(x);
      if (puyo.hitArea.contains(canvasX, canvasY)) {
        return x;
      }
    }
    return -1;
  }

  setPaintColor(color) {
    this.paintColor = color;
  }

  setEditPaintColor(color) {
    this.editPaintColor = color;
    if (color === -1) this.app.renderer.background.color = backgroundColor;
    else this.app.renderer.background.color = backgroundColorForEditMode;
  }

  setPuyoColor(x, y, color) {
    this.puyoSprites[y][x].texture = this.puyoTextures[color];
  }
  setNextPuyoColor(x, color) {
    this.nextPuyoSprites[x].texture = this.puyoTextures[color + 9];
  }
  setVisiblePuyo(x, y) {
    this.puyoSprites[y][x].visible = true;
  }

  setInvisiblePuyo(x, y) {
    this.puyoSprites[y][x].visible = false;
    this.plusSprites[y][x].visible = false;
  }

  setInvisiblePuyos(points) {
    for (const p of points) {
      this.puyoSprites[p.y][p.x].visible = false;
      this.plusSprites[p.y][p.x].visible = false;
    }
  }

  setVisibleNext(x) {
    this.nextPuyoSprites[x].visible = true;
  }
  setInvisibleNext(x) {
    this.nextPuyoSprites[x].visible = false;
    this.nextPlusSprites[x].visible = false;
  }
  setInvisibleNexts(list) {
    for (const x of list) {
      this.nextPuyoSprites[x].visible = false;
      this.nextPlusSprites[x].visible = false;
    }
  }

  allPuyoVisible() {
    for (let y = 0; y < this.field.height; y++) {
      for (let x = 0; x < this.field.width; x++) {
        this.setVisiblePuyo(x, y);
      }
    }
  }

  allNextVisible() {
    for (let x = 0; x < this.field.width; x++) {
      this.setVisibleNext(x);
    }
  }

  allVisible() {
    this.allPuyoVisible();
    this.allNextVisible();
  }

  getPuyoSprite(x, y) {
    if (!this.field.isRangeField(x, y)) return null;
    return this.puyoSprites[y][x];
  }
  getPuyoContainer(x, y) {
    if (!this.field.isRangeField(x, y)) return null;
    return this.puyoContainers[y][x];
  }

  getNextPuyoSprite(x) {
    if (!this.field.isRangeField(x, 0)) return null;
    return this.nextPuyoSprites[x];
  }

  isSelected(x, y) {
    if (!this.field.isRangeField(x, y)) return false;
    return this.selectedField[y][x];
  }

  select(x, y) {
    this.selectedField[y][x] = true;
  }

  deleteSelectPuyo() {
    this.field.deletePuyos(this.selectRoute.points);
  }

  paintSelectPuyo() {
    for (const p of this.selectRoute.points) {
      this.field.setColor(p.x, p.y, this.paintColor);
    }
  }

  setRoute(route) {
    this.selectRoute = route.clone();
  }

  resetRoute() {
    this.eraseSelectedPaintPuyo();
    this.selectRoute = new Route();
  }

  /**
   * 指定座標に隣接している座標が選択済みか調べる
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isAdjacentSelected(x, y) {
    const adjacentPoint = [
      new Point(-1, -1),
      new Point(0, -1),
      new Point(1, -1),
      new Point(1, 0),
      new Point(1, 1),
      new Point(0, 1),
      new Point(-1, 1),
      new Point(-1, 0),
    ];
    for (const point of adjacentPoint) {
      const p = new Point(point.x + x, point.y + y);
      if (this.isSelected(p.x, p.y)) return true;
    }
    return false;
  }
}
