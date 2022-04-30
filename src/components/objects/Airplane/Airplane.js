import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three'
import MODEL from './scene.gltf';

class Airplane extends Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();


        this.state = {
            mixer: null,
            prevTimeStamp: null,
            parent: parent,
            animation: null,
            action: null,
            hit: null,
            hitTime: null,
            reward: null,
            rewardTime: null,
            barrel: null,
            speed: 1000
        };

        this.name = 'plane';
        this.tip = new THREE.Vector3(0, 0, 0);
        this.state.hit = true;
        this.state.reward = false;
        this.state.barrel = false;
        this.addPlane()

        // Add update list
        parent.addToUpdateList(this);
    }

    addPlane() {
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            gltf.scene.scale.multiplyScalar(3);
            gltf.scene.position.x = 0;
            gltf.scene.position.y = 0;
            gltf.scene.position.z = 0;
            const box = new THREE.Box3().setFromObject(gltf.scene, true);
            // const center = box.getCenter( new THREE.Vector3() );

            gltf.scene.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            // gltf.scene.position.x += ( gltf.scene.position.x - center.x );
            // gltf.scene.position.y += ( gltf.scene.position.y - center.y );
            // gltf.scene.position.z += ( gltf.scene.position.z - center.z );
            // console.log(center)

            // add mixer to state
            this.state.mixer = new THREE.AnimationMixer(gltf.scene);

            const clip = gltf.animations[0]
            this.state.action = this.state.mixer.clipAction(clip)
            this.state.action.play();

            this.box = box;

            this.add(gltf.scene);
        });
    }

    update(timeStamp) {
        if (this.state.prevTimeStamp === null) {
            this.state.prevTimeStamp = timeStamp;
        }

        // Angle correction
        if (Math.abs(this.rotation.z) < 0.005) {
                this.rotation.z = 0;
        } else {
                this.rotation.z -= Math.sign(this.rotation.z) * 0.005;
        }
        if (Math.abs(this.rotation.x) < 0.005) {
            this.rotation.x = 0;
        } else {
                this.rotation.x -= Math.sign(this.rotation.x) * 0.005;
        }
        
        if (this.parent.chunkManager.state.climbing > 0) {
            this.rotation.x += 0.01;
        }
        // this.rotation.z -= Math.sign(this.rotation.z) * 0.005;

        let delta;
        if (this.state.hit) {
            this.state.hit = false
            this.state.hitTime = timeStamp
            this.state.speed = 100
        }

        if (this.state.reward) {
            this.state.rewardTime = timeStamp;
            this.state.reward = false
            this.state.barrel = true;
        }

        if (this.state.barrel) {
            let temp = Math.PI - this.rotation.z
            this.rotation.z += (-Math.pow(temp,2) + Math.pow((Math.PI * 1.15),2))/35;
            if (Math.abs(this.rotation.z) > 2 * Math.PI + 0.2) {
                this.rotation.z -= Math.sign(this.rotation.z) * 2 * Math.PI;
                this.state.barrel = false
            }
        }   

        // wobble if hit previously
        if ((timeStamp - this.state.hitTime) < 5000) {
            if ((timeStamp - this.state.hitTime) < 2500) {
                if (Math.round((timeStamp - this.state.hitTime)) % 4 == 0) {
                    this.visible = !this.visible;
                }
            } else {
                this.visible = true;
            }
            
            this.state.speed += (timeStamp - this.state.hitTime) / 1000;
        } else {
            // calculate delta
            this.state.speed = 1000;
        }
        delta = (timeStamp - this.state.prevTimeStamp) / this.state.speed;


        // update previous time stamp
        this.state.prevTimeStamp = timeStamp;

        // update animation
        this.state.mixer.update(delta);
    }

    null() {
        console.log("null");
        this.rotation.z = 0;
        this.rotation.x = 0;
        this.state.prevTimeStamp = null;
        this.state.hitTime = null;
        this.state.hit = false;
        this.state.reward = false;
        this.state.barrel = false;
        this.visible = true;
        this.speed = 1000;
    }

}

export default Airplane;
