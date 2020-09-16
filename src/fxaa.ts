import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { SkinViewer, SkinViewerOptions } from "./viewer.js";

export interface FXAASkinViewerOptions extends SkinViewerOptions {
    /**
     * Options:
     * - 10 to 15 - default medium dither (10=fastest, 15=highest quality)
     * - 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)
     * - 39       - no dither, very expensive
     *
     * Notes:
     * - 12 = slightly faster then FXAA 3.9 and higher edge quality (default)
     * - 13 = about same speed as FXAA 3.9 and better than 12
     * - 23 = closest to FXAA 3.9 visually and performance wise
     * - .**d** = the lowest digit is directly related to performance
     * - **d**. = the highest digit is directly related to style
     *
     * See also: https://github.com/mrdoob/three.js/blob/7bb3c2c9205c516c8d1943a734e745a9088fc5ef/examples/jsm/shaders/FXAAShader.js#L203-L230
     */
    fxaaQualityPreset?: 10 | 11 | 12 | 13 | 14 | 15 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 39;
}

export class FXAASkinViewer extends SkinViewer {

    readonly composer: EffectComposer;
    readonly renderPass: RenderPass;
    readonly fxaaPass: ShaderPass;

    /**
     * Note: FXAA doesn't work well with transparent backgrounds.
     * It's recommended to use an opaque background and set `options.alpha` to false.
     */
    constructor(options: FXAASkinViewerOptions = {}) {
        super(options);
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);

        if (options.fxaaQualityPreset === undefined) {
            this.fxaaPass = new ShaderPass(FXAAShader);
        } else {
            const customFXAAShader = Object.assign({}, FXAAShader);
            customFXAAShader.fragmentShader = customFXAAShader.fragmentShader.replace(
                /^\s*#define FXAA_QUALITY_PRESET \d+\s*$/gm,
                `#define FXAA_QUALITY_PRESET ${options.fxaaQualityPreset}`
            );
            this.fxaaPass = new ShaderPass(customFXAAShader);
        }

        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.fxaaPass);
        this.updateComposerSize();
    }

    setSize(width: number, height: number): void {
        super.setSize(width, height);
        if (this.composer !== undefined) {
            this.updateComposerSize();
        }
    }

    private updateComposerSize(): void {
        this.composer.setSize(this.width, this.height);
        const pixelRatio = this.renderer.getPixelRatio();
        this.composer.setPixelRatio(pixelRatio);
        this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.width * pixelRatio);
        this.fxaaPass.material.uniforms["resolution"].value.y = 1 / (this.height * pixelRatio);
    }

    render(): void {
        this.composer.render();
    }

    dispose(): void {
        super.dispose();
        (this.fxaaPass.fsQuad as Pass.FullScreenQuad).dispose();
    }
}
