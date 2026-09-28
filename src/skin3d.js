// Pixel-Perfect 3D Minecraft Skin & Cape Studio using skinview3d
import { SkinViewer, WalkingAnimation, IdleAnimation, RunningAnimation, WaveAnimation, FlyingAnimation } from 'skinview3d';

export class Skin3DStudio {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.viewer = null;
    this.currentSkinUrl = null;
    this.currentCapeUrl = null;
    this.currentAnimation = null;
    this.animationType = 'walk';
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const width = this.container.clientWidth || 340;
    const height = this.container.clientHeight || 360;

    const canvas = document.createElement('canvas');
    this.container.appendChild(canvas);

    this.viewer = new SkinViewer({
      canvas: canvas,
      width: width,
      height: height,
      model: 'default' // 'default' or 'slim'
    });

    this.viewer.autoRotate = true;
    this.viewer.autoRotateSpeed = 0.8;
    this.viewer.camera.position.set(0, 0, 60);

    this.setAnimation('walk');
  }

  setAnimation(type) {
    if (!this.viewer) return;
    this.animationType = type;

    if (type === 'walk') {
      this.viewer.animation = new WalkingAnimation();
      this.viewer.animation.speed = 0.6;
    } else if (type === 'run') {
      this.viewer.animation = new RunningAnimation();
      this.viewer.animation.speed = 0.8;
    } else if (type === 'idle') {
      this.viewer.animation = new IdleAnimation();
      this.viewer.animation.speed = 0.5;
    } else if (type === 'wave') {
      this.viewer.animation = new WaveAnimation();
      this.viewer.animation.speed = 0.7;
    } else if (type === 'fly') {
      this.viewer.animation = new FlyingAnimation();
      this.viewer.animation.speed = 0.7;
    } else {
      this.viewer.animation = null;
    }
  }

  loadSkinTexture(skinUrl, capeUrl = null, isSlim = false) {
    if (!this.viewer) this.init();
    if (!this.viewer) return;

    this.currentSkinUrl = skinUrl;
    this.currentCapeUrl = capeUrl;

    // Set model type (slim for Alex 3px arm, default for Steve 4px arm)
    this.viewer.playerObject.skin.modelType = isSlim ? 'slim' : 'default';

    if (skinUrl) {
      this.viewer.loadSkin(skinUrl).catch(e => {
        console.warn('Direct skin load error, trying fallback proxy...', e);
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(skinUrl)}`;
        this.viewer.loadSkin(proxyUrl).catch(() => {});
      });
    }

    if (capeUrl) {
      this.viewer.loadCape(capeUrl).catch(e => {
        console.warn('Direct cape load error, trying proxy...', e);
        const proxyCape = `https://corsproxy.io/?${encodeURIComponent(capeUrl)}`;
        this.viewer.loadCape(proxyCape).catch(() => {});
      });
    } else {
      this.viewer.resetCape();
    }
  }

  toggleAutoRotate() {
    if (!this.viewer) return false;
    this.viewer.autoRotate = !this.viewer.autoRotate;
    return this.viewer.autoRotate;
  }

  resetView() {
    if (!this.viewer) return;
    this.viewer.camera.position.set(0, 0, 60);
    this.viewer.camera.rotation.set(0, 0, 0);
  }

  toggleOuterLayer() {
    if (!this.viewer) return true;
    const skinObj = this.viewer.playerObject.skin;
    const isVisible = skinObj.head.outerLayer.visible;
    
    // Toggle outer layers
    skinObj.head.outerLayer.visible = !isVisible;
    skinObj.body.outerLayer.visible = !isVisible;
    skinObj.rightArm.outerLayer.visible = !isVisible;
    skinObj.leftArm.outerLayer.visible = !isVisible;
    skinObj.rightLeg.outerLayer.visible = !isVisible;
    skinObj.leftLeg.outerLayer.visible = !isVisible;

    return !isVisible;
  }

  destroy() {
    if (this.viewer) {
      this.viewer.dispose();
      this.viewer = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
