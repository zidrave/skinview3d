import { NearestFilter, PerspectiveCamera, Scene, Texture, Vector2, WebGLRenderer } from "three";
import { RootAnimation } from "./animation.js";
import { PlayerObject } from "./model.js";
import { isSlimSkin, loadCapeToCanvas, loadSkinToCanvas } from "skinview-utils";

export interface SkinViewerOptions {
	domElement: Node;
	animation?: Animation;
	skinUrl?: string;
	capeUrl?: string;
	width?: number;
	height?: number;
	detectModel?: boolean;
}

export class SkinViewer {

	public readonly domElement: Node;
	public readonly animations: RootAnimation = new RootAnimation();
	public detectModel: boolean = true;
	public disposed: boolean = false;

	public readonly skinImg: HTMLImageElement;
	public readonly skinCanvas: HTMLCanvasElement;
	public readonly skinTexture: Texture;

	public readonly capeImg: HTMLImageElement;
	public readonly capeCanvas: HTMLCanvasElement;
	public readonly capeTexture: Texture;

	public readonly scene: Scene;
	public readonly camera: PerspectiveCamera;
	public readonly renderer: WebGLRenderer;

	public readonly playerObject: PlayerObject;

	private _renderPaused: boolean = false;

	constructor(options: SkinViewerOptions) {
		this.domElement = options.domElement;
		if (options.detectModel === false) {
			this.detectModel = false;
		}

		// texture
		this.skinImg = new Image();
		this.skinCanvas = document.createElement("canvas");
		this.skinTexture = new Texture(this.skinCanvas);
		this.skinTexture.magFilter = NearestFilter;
		this.skinTexture.minFilter = NearestFilter;

		this.capeImg = new Image();
		this.capeCanvas = document.createElement("canvas");
		this.capeTexture = new Texture(this.capeCanvas);
		this.capeTexture.magFilter = NearestFilter;
		this.capeTexture.minFilter = NearestFilter;

		// scene
		this.scene = new Scene();

		// Use smaller fov to avoid distortion
		this.camera = new PerspectiveCamera(40);
		this.camera.position.y = -12;
		this.camera.position.z = 60;

		this.renderer = new WebGLRenderer({ alpha: true });
		this.renderer.setSize(300, 300); // default size
		this.domElement.appendChild(this.renderer.domElement);

		this.playerObject = new PlayerObject(this.skinTexture, this.capeTexture);
		this.playerObject.name = "player";
		this.playerObject.skin.visible = false;
		this.playerObject.cape.visible = false;
		this.scene.add(this.playerObject);

		// texture loading
		this.skinImg.crossOrigin = "anonymous";
		this.skinImg.onerror = () => console.error("Failed loading " + this.skinImg.src);
		this.skinImg.onload = () => {
			loadSkinToCanvas(this.skinCanvas, this.skinImg);

			if (this.detectModel) {
				this.playerObject.skin.slim = isSlimSkin(this.skinCanvas);
			}

			this.skinTexture.needsUpdate = true;
			this.playerObject.skin.visible = true;
		};

		this.capeImg.crossOrigin = "anonymous";
		this.capeImg.onerror = () => console.error("Failed loading " + this.capeImg.src);
		this.capeImg.onload = () => {
			loadCapeToCanvas(this.capeCanvas, this.capeImg);

			this.capeTexture.needsUpdate = true;
			this.playerObject.cape.visible = true;
		};

		if (options.skinUrl) this.skinUrl = options.skinUrl;
		if (options.capeUrl) this.capeUrl = options.capeUrl;
		if (options.width) this.width = options.width;
		if (options.height) this.height = options.height;

		window.requestAnimationFrame(() => this.draw());
	}

	private draw() {
		if (this.disposed || this._renderPaused) {
			return;
		}
		this.animations.runAnimationLoop(this.playerObject);
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(() => this.draw());
	}

	setSize(width: number, height: number) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}

	dispose() {
		this.disposed = true;
		this.domElement.removeChild(this.renderer.domElement);
		this.renderer.dispose();
		this.skinTexture.dispose();
		this.capeTexture.dispose();
	}

	get renderPaused() {
		return this._renderPaused;
	}

	set renderPaused(value: boolean) {
		const toResume = !this.disposed && !value && this._renderPaused;
		this._renderPaused = value;
		if (toResume) {
			window.requestAnimationFrame(() => this.draw());
		}
	}

	get skinUrl() {
		return this.skinImg.src;
	}

	set skinUrl(url) {
		this.skinImg.src = url;
	}

	get capeUrl() {
		return this.capeImg.src;
	}

	set capeUrl(url) {
		this.capeImg.src = url;
	}

	get width() {
		const target = new Vector2();
		return this.renderer.getSize(target).width;
	}

	set width(newWidth) {
		this.setSize(newWidth, this.height);
	}

	get height() {
		const target = new Vector2();
		return this.renderer.getSize(target).height;
	}

	set height(newHeight) {
		this.setSize(this.width, newHeight);
	}
}
