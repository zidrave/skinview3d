skinview3d
========

[![CI Status](https://img.shields.io/github/workflow/status/bs-community/skinview3d/CI?label=CI&logo=github&style=flat-square)](https://github.com/bs-community/skinview3d/actions?query=workflow:CI)
[![NPM Package](https://img.shields.io/npm/v/skinview3d.svg?style=flat-square)](https://www.npmjs.com/package/skinview3d)
[![MIT License](https://img.shields.io/badge/license-MIT-yellowgreen.svg?style=flat-square)](https://github.com/bs-community/skinview3d/blob/master/LICENSE)
[![Gitter Chat](https://img.shields.io/gitter/room/TechnologyAdvice/Stardust.svg?style=flat-square)](https://gitter.im/skinview3d/Lobby)

Three.js powered Minecraft skin viewer.

**********************************************
# Features
* 1.8 Skins
* HD Skins
* Capes
* Elytras
* Slim Arms
  * Automatic model detection (Slim / Default)

# Usage
[Example of using skinview3d](https://bs-community.github.io/skinview3d/)
```html
<canvas id="skin_container"></canvas>
<script>
	let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container"),
		width: 300,
		height: 400,
		skin: "img/skin.png"
	});

	// Change viewer size
	skinViewer.width = 600;
	skinViewer.height = 800;

	// Load another skin
	skinViewer.loadSkin("img/skin2.png");

	// Load a cape
	skinViewer.loadCape("img/cape.png");

	// Load an elytra (from a cape texture)
	skinViewer.loadCape("img/cape.png", { backEquipment: "elytra" });

	// Unload(hide) the cape / elytra
	skinViewer.loadCape(null);

	// Set the background color
	skinViewer.background = 0x5a76f3;

	// Set the background to a panoramic image!
	skinViewer.loadPanorama("img/panorama1.png");

	// Change camera FOV
	skinViewer.fov = 70;

	// Control objects with your mouse!
	let control = skinview3d.createOrbitControls(skinViewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	// Add an animation
	let walk = skinViewer.animations.add(skinview3d.WalkingAnimation);
	// Add another animation
	let rotate = skinViewer.animations.add(skinview3d.RotatingAnimation);
	// Remove an animation, stop walking dude
	walk.remove();
	// Remove the rotating animation, and make the player face forward
	rotate.resetAndRemove();
	// And run for now!
	let run = skinViewer.animations.add(skinview3d.RunningAnimation);

	// Set the speed of an animation
	run.speed = 3;
	// Pause single animation
	run.paused = true;
	// Pause all animations!
	skinViewer.animations.paused = true;
</script>
```

## Anti-aliasing
skinview3d supports FXAA (fast approximate anti-aliasing).
To enable it, you need to replace `SkinViewer` with `FXAASkinViewer`.

Note that FXAA is incompatible with transparent backgrounds.
So when FXAA is enabled, the default background color will be white instead of transparent.

# Build
`npm run build`
