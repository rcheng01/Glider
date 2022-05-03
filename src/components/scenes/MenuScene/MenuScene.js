import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land, Kite, Falcon, Paper, Terrain, Airplane, ChunkManager, Turbine} from '../../objects';
import { BasicLights } from 'lights';
import * as THREE from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js'
import * as utils from "../../../js/utils.js"
import { Sky } from '../../objects/index.js';

class MenuScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Add fog
        this.fog = new THREE.FogExp2(0xd19264, 0.0015);
        // this.fog =  new THREE.Fog(0xADD8E6, 10, 1500);

        const airplane = new Airplane(this)
        this.sky = new Sky();
        this.sky.scale.setScalar(1000);

        // LIGHTING
        const lights = new BasicLights();

        const hemiLight = new THREE.HemisphereLight(0xFF8F00, 0xffffff, 0.9)
        hemiLight.castShadow = true;

        const dirLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
        dirLight.position.set( 0, 10, 0 );

        this.sun = new THREE.Vector3();

        // this.add(lights, this.sky, airplane, chunkManager);
        this.add(hemiLight, this.sky, dirLight, airplane);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    initSky(renderer, camera) {
        // GUI

        const effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 2,
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
        // this.spotLight.position.z += 3;
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default MenuScene;