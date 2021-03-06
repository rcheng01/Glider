import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Airplane, ChunkManager } from '../../objects';
import { BasicLights } from 'lights';
import * as THREE from 'three'
import { Sky } from '../../objects/index.js';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            skyIndicator: 1,
            azimuth: 180,
            elevation: 5,
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);
        this.fogColor = new Color(0xd19264);

        // Add fog
        this.fog = new THREE.FogExp2(this.fogColor, 0.0015);

        // Add meshes to scene
        const airplane = new Airplane(this);

        // LIGHTING
        this.lights = new BasicLights();

        const chunkManager = new ChunkManager(this);
        this.chunkManager = chunkManager;

        this.sky = new Sky();
        this.sky.scale.setScalar(1000);

        this.sun = new THREE.Vector3();

        this.add(this.lights, this.sky, airplane, chunkManager);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    // Initialize sky with gui controls
    initSky(renderer, camera) {
        // GUI

        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.6,
            elevation: 5,
            azimuth: 180,
            exposure: renderer.toneMappingExposure
        };

        let sky = this.sky
        let sun = this.sun
        let scene = this

        function guiChanged() {

            const uniforms = sky.material.uniforms;
            uniforms['turbidity'].value = effectController.turbidity;
            uniforms['rayleigh'].value = effectController.rayleigh;
            uniforms['mieCoefficient'].value = effectController.mieCoefficient;
            uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

            const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
            const theta = THREE.MathUtils.degToRad(effectController.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            uniforms['sunPosition'].value.copy(sun);

            renderer.toneMappingExposure = effectController.exposure;
            renderer.render(scene, camera);

        }

        this.state.gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(guiChanged);
        this.state.gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
        this.state.gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
        this.state.gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
        this.state.gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(guiChanged);
        this.state.gui.add(effectController, 'azimuth', - 180, 180, 0.1).onChange(guiChanged);
        this.state.gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);

        guiChanged();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;

        let skyUniforms = this.sky.material.uniforms;

        // Oscillating rayleigh
        let rayleigh = skyUniforms['rayleigh'].value
        if (rayleigh >= 10 || rayleigh <= 2) {
            this.state.skyIndicator *= -1;
        }
        skyUniforms['rayleigh'].value += 0.01 * this.state.skyIndicator;


        // Sun rising and falling
        let curAzimuth = this.state.azimuth % 360;

        let delta = 180 - curAzimuth
        this.state.elevation = Math.min(6, Math.max(0, this.state.elevation + Math.sign(delta) * Math.pow(Math.abs(delta), 0.2) / 180));

        if (curAzimuth < 100 || curAzimuth > 260) {
            this.state.azimuth += 0.5;
            this.state.elevation = 0;
        }
        else if (curAzimuth < 150 || curAzimuth > 210) {
            let weight = Math.abs(180 - curAzimuth) / 30;
            this.state.azimuth += 0.06 * Math.pow(weight, 4);
        } else {
            this.state.azimuth += 0.04;
        }
        const phi = THREE.MathUtils.degToRad(90 - this.state.elevation);
        const theta = THREE.MathUtils.degToRad(this.state.azimuth);
        this.sun.setFromSphericalCoords(1, phi, theta);
        skyUniforms['sunPosition'].value.copy(this.sun);

        // Update lighting
        this.lights.hemiLight.intensity = 0.4 + this.state.elevation / 12;
        this.lights.dirLight.intensity = 0.3 + this.state.elevation / 10;
        this.fog.color = this.fogColor.clone().multiplyScalar(0.2 + this.state.elevation / 8);


        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    reset(character) {
        const plane = this.getObjectByName(character);
        const chunkManager = this.getObjectByName('chunkManager');
        const stars = this.getObjectByName("stars");

        plane.position.x = 0;
        plane.position.y = 0;
        plane.position.z = 0;
        plane.rotation.z = 0;
        plane.rotation.x = 0;
        plane.state.hit = false;

        chunkManager.position.y = 0;
        chunkManager.state.toSpace = false;
        chunkManager.state.spaceRewardHeight = 0;
        chunkManager.state.falling = 0;
        chunkManager.state.climbing = 0;
        if (chunkManager.state.biome != "default") chunkManager.resetBiome();

        if (stars !== undefined) this.remove(stars);
    }
}

export default SeedScene;
