const BABYLON = window.BABYLON;

export default class {
  /**
   * Create the scene
   * @param {CANVAS} $canvas The HTML Canvas to contain our Babylon (and PoseNet) scene
   */
  constructor($canvas) {
    this.$canvas = $canvas;
    this.plugins = {};
    this.engine = new BABYLON.Engine($canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.head = null;
    this.camera = null;

    this.createScene();
    this.startLoop();
    this.addEventListeners();
  }

  /**
   * Creates the scene
   */
  createScene() {
    this.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / -2,
      Math.PI / 2,
      1,
      new BABYLON.Vector3(0, 0, 5),
      this.scene
    );
    this.camera.attachControl(this.$canvas, true);

    BABYLON.SceneLoader.Append("./3d/", "scene.gltf", this.scene, scene => {
      new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      scene.activeCamera.alpha += Math.PI;

      this.head = scene.meshes[0];
      this.head.rotationQuaternion = null;
      this.head.scaling = new BABYLON.Vector3(0.005, 0.005, 0.005);

      this.$canvas.style.width = "100%";
      this.camera.detachControl(this.$canvas);
    });
  }

  /**
   * Starts the render loop
   */
  startLoop() {
    this.engine.runRenderLoop(() => {
      this.scene.render();

      Object.keys(this.plugins).forEach(key => {
        this.plugins[key].call(this);
      });
    });
  }

  /**
   * Adds a plugin to be called on every scene render
   * @param {Function} callback The callback to call
   */
  use(name, callback) {
    this.plugins[name] = callback;
  }

  /**
   * Move the head with the mouse
   */
  addEventListeners() {
    let currentPosition = { x: 0, y: 0 };
    let clicked = false;

    this.$canvas.addEventListener("pointerdown", evt => {
      currentPosition.x = evt.clientX;
      currentPosition.y = evt.clientY;
      clicked = true;
    });
    this.$canvas.addEventListener("pointermove", evt => {
      if (!clicked) {
        return;
      }
      this.head.rotation.y = (evt.clientX + currentPosition.x) / 20;
      this.head.rotation.x = (evt.clientY + currentPosition.y) / 20;
    });
    this.$canvas.addEventListener("pointerup", () => {
      clicked = false;
    });
  }
}
