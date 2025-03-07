(function (Scratch) {
  'use strict';

  /**
   * @param {RenderWebGL.SVGSkin} svgSkin
   * @returns {Promise<void>}
  */
  const svgSkinFinishedLoading = svgSkin => new Promise(resolve => {
    if (svgSkin._svgImageLoaded) {
      resolve();
    } else {
      svgSkin._svgImage.addEventListener('load', () => {
        resolve();
      });
      svgSkin._svgImage.addEventListener('error', () => {
        resolve();
      });
    }
  });

  const runtime = Scratch.vm.runtime;
  const renderer = runtime.renderer;
  const Cast = Scratch.Cast;

  var createdSkins = [];

  class Skins {
    constructor() {
      runtime.on('PROJECT_START', () => {
        this._refreshTargets();
      });

      runtime.on('PROJECT_STOP_ALL', () => {
        this._refreshTargets();
      });
    }

    getInfo() {
      return {
        id: 'lmsSkins',
        name: 'Skins',
        color1: '#6b56ff',
        blocks: [
          {
            opcode: 'registerSVGSkin',
            blockType: Scratch.BlockType.COMMAND,
            text: '创建SVG皮肤 [SVG] 为 [NAME]',
            arguments: {
              SVG: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '<svg />'
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },

          '---',

          {
            opcode: 'registerCostumeSkin',
            blockType: Scratch.BlockType.COMMAND,
            text: '从 [COSTUME] 作为 [NAME] 加载皮肤',
            arguments: {
              COSTUME: {
                type: Scratch.ArgumentType.COSTUME
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },
          {
            opcode: 'registerURLSkin',
            blockType: Scratch.BlockType.COMMAND,
            text: '从 URL: [URL]加载皮肤 [NAME]',
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://extensions.turbowarp.org/dango.png'
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },
          {
            opcode: 'getSkinLoaded',
            blockType: Scratch.BlockType.BOOLEAN,
            text: '皮肤 [NAME] 加载了?',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },

          '---',

          {
            opcode: 'setSkin',
            blockType: Scratch.BlockType.COMMAND,
            text: '设置 [TARGET] 的皮肤为 [NAME]',
            arguments: {
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: 'targetMenu'
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },
          {
            opcode: 'restoreSkin',
            blockType: Scratch.BlockType.COMMAND,
            text: '恢复 [TARGET] 的皮肤',
            arguments: {
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: 'targetMenu'
              }
            }
          },
          {
            opcode: 'restoreTargets',
            blockType: Scratch.BlockType.COMMAND,
            text: '用 [NAME] 恢复目标',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },

          '---',

          {
            opcode: 'getCurrentSkin',
            blockType: Scratch.BlockType.REPORTER,
            text: '[TARGET] 的当前皮肤',
            arguments: {
              TARGET: {
                type: Scratch.ArgumentType.STRING,
                menu: 'targetMenu'
              }
            }
          },
          {
            opcode: 'getSkinAttribute',
            blockType: Scratch.BlockType.REPORTER,
            text: '皮肤 [NAME] 的 [ATTRIBUTE]',
            arguments: {
              ATTRIBUTE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'skinAttributes'
              },
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },

          '---',

          {
            opcode: 'deleteSkin',
            blockType: Scratch.BlockType.COMMAND,
            text: '删除皮肤 [NAME]',
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '我的皮肤'
              }
            }
          },
          {
            opcode: 'deleteAllSkins',
            blockType: Scratch.BlockType.COMMAND,
            text: '删除所有皮肤'
          }
        ],
        menus: {
          targetMenu: {
            acceptReporters: true,
            items: '_getTargets'
          },
          skinAttributes: {
            acceptReporters: true,
            items: ['宽度', '高度']
          }
        }
      };
    }

    async registerSVGSkin (args) {
      const skinName = Cast.toString(args.NAME);
      const svgData = Cast.toString(args.SVG);

      let oldSkinId = null;
      if (createdSkins[skinName]) {
        oldSkinId = createdSkins[skinName];
      }

      // This generally takes a few frames, so yield the block
      const skinId = renderer.createSVGSkin(svgData);
      createdSkins[skinName] = skinId;

      await svgSkinFinishedLoading(renderer._allSkins[skinId]);

      if (oldSkinId) {
        this._refreshTargetsFromID(oldSkinId, false, skinId);
        renderer.destroySkin(oldSkinId);
      }
    }

    async registerCostumeSkin (args, util) {
      if (!requireNonPackagedRuntime('add costume skin')) {
        return;
      }

      const skinName = Cast.toString(args.NAME);
      const costumeIndex = util.target.getCostumeIndexByName(args.COSTUME);
      if (costumeIndex === -1) return;
      const costume = util.target.sprite.costumes[costumeIndex];

      const url = costume.asset.encodeDataURI();
      const rotationCenterX = costume.rotationCenterX;
      const rotationCenterY = costume.rotationCenterY;

      let rotationCenter = [rotationCenterX, rotationCenterY];
      if (!rotationCenterX || !rotationCenterY) rotationCenter = null;

      let oldSkinId = null;
      if (createdSkins[skinName]) {
        oldSkinId = createdSkins[skinName];
      }

      const skinId = await this._createURLSkin(url, rotationCenter);
      createdSkins[skinName] = skinId;

      if (oldSkinId) {
        this._refreshTargetsFromID(oldSkinId, false, skinId);
        renderer.destroySkin(oldSkinId);
      }
    }

    async registerURLSkin (args) {
      const skinName = Cast.toString(args.NAME);
      const url = Cast.toString(args.URL);

      let oldSkinId = null;
      if (createdSkins[skinName]) {
        oldSkinId = createdSkins[skinName];
      }

      const skinId = await this._createURLSkin(url);
      if (!skinId) return;
      createdSkins[skinName] = skinId;

      if (oldSkinId) {
        this._refreshTargetsFromID(oldSkinId, false, skinId);
        renderer.destroySkin(oldSkinId);
      }
    }

    getSkinLoaded (args) {
      const skinName = Cast.toString(args.NAME);
      return !!(createdSkins[skinName]);
    }

    setSkin (args, util) {
      const skinName = Cast.toString(args.NAME);
      if (!createdSkins[skinName]) return;

      const targetName = Cast.toString(args.TARGET);
      const target = this._getTargetFromMenu(targetName, util);
      if (!target) return;
      const drawableID = target.drawableID;

      const skinId = createdSkins[skinName];
      renderer._allDrawables[drawableID].skin = renderer._allSkins[skinId];
    }

    restoreSkin (args, util) {
      const targetName = Cast.toString(args.TARGET);
      const target = this._getTargetFromMenu(targetName, util);
      if (!target) return;
      target.updateAllDrawableProperties();
    }

    getCurrentSkin (args, util) {
      const targetName = Cast.toString(args.TARGET);
      const target = this._getTargetFromMenu(targetName, util);
      if (!target) return;
      const drawableID = target.drawableID;

      const skinId = renderer._allDrawables[drawableID].skin._id;
      const skinName = this._getSkinNameFromID(skinId);
      return (skinName) ? skinName : '';
    }

    getSkinAttribute (args) {
      const skins = renderer._allSkins;
      const skinName = Cast.toString(args.NAME);

      if (!createdSkins[skinName]) return 0;
      const skinId = createdSkins[skinName];
      if (!skins[skinId]) return 0;

      const size = skins[skinId].size;
      const attribute = Cast.toString(args.ATTRIBUTE).toLowerCase();

      switch (attribute) {
        case ('宽度'): return Math.ceil(size[0]);
        case ('高度'): return Math.ceil(size[1]);
        default: return 0;
      }
    }

    deleteSkin (args) {
      const skinName = Cast.toString(args.NAME);
      if (!createdSkins[skinName]) return;
      const skinId = createdSkins[skinName];

      this._refreshTargetsFromID(skinId, true);
      renderer.destroySkin(skinId);
      Reflect.deleteProperty(createdSkins, skinName);
    }

    deleteAllSkins () {
      this._refreshTargets();
      for (let i = 0; i < createdSkins.length; i++) renderer.destroySkin(createdSkins[i]);
      createdSkins = [];
    }

    restoreTargets (args) {
      const skinName = Cast.toString(args.NAME);
      if (!createdSkins[skinName]) return;
      const skinId = createdSkins[skinName];

      this._refreshTargetsFromID(skinId, true);
    }

    // Utility Functions

    _refreshTargetsFromID (skinId, reset, newId) {
      const drawables = renderer._allDrawables;
      const skins = renderer._allSkins;

      for (const target of runtime.targets) {
        const drawableID = target.drawableID;
        const targetSkin = drawables[drawableID].skin.id;

        if (targetSkin === skinId) {
          target.updateAllDrawableProperties();
          if (!reset) drawables[drawableID].skin = (newId) ? skins[newId] : skins[skinId];
        }
      }
    }

    _refreshTargets () {
      for (const target of runtime.targets) {
        target.updateAllDrawableProperties();
      }
    }

    _getSkinNameFromID (skinId) {
      for (const skinName in createdSkins) {
        if (createdSkins[skinName] === skinId) return skinName;
      }
    }

    _getTargetFromMenu (targetName, util) {
      let target = Scratch.vm.runtime.getSpriteTargetByName(targetName);
      if (targetName === '_myself_') target = util.target;
      if (targetName === '_stage_') target = runtime.getTargetForStage();
      return target;
    }

    async _createURLSkin (URL, rotationCenter) {
      let imageData;
      if (await Scratch.canFetch(URL)) {
        imageData = await Scratch.fetch(URL);
      } else {
        return;
      }

      const contentType = imageData.headers.get("Content-Type");
      if (contentType === 'image/svg+xml') {
        return renderer.createSVGSkin(await imageData.text(), rotationCenter);
      } else if (contentType === 'image/png' || contentType === 'image/jpeg' || contentType === 'image/bmp') {
        // eslint-disable-next-line no-restricted-syntax
        const output = new Image();
        output.src = URL;
        output.crossOrigin = 'anonymous';
        await output.decode();
        return renderer.createBitmapSkin(output);
      }
    }

    _getTargets() {
      const spriteNames = [
        {text: '自己', value: '_myself_'},
        {text: '舞台', value: '_stage_'}
      ];
      const targets = Scratch.vm.runtime.targets;
      for (let index = 1; index < targets.length; index++) {
        const target = targets[index];
        if (target.isOriginal) {
          const targetName = target.getName();
          spriteNames.push({
            text: targetName,
            value: targetName
          });
        }
      }
      return spriteNames;
    }

  }
  Scratch.extensions.register(new Skins());
})(Scratch);
