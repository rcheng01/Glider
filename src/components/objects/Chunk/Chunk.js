import { Group } from 'three';
import { Terrain } from '../Terrain';

class Chunk extends Group {
    constructor(parent, xOffset, yOffset, zOffset) {
        // console.log("CONSTRUCTOR CHUNK x: " + xOffset + " t: " + yOffset + " z: " + zOffset)
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            gui: parent.state.gui,
            parent: parent,
        };

        // feed in the parent (chunk manager) as it has the proper terrain variables
        this.setChunkPosition(xOffset, yOffset, zOffset);
        this.terrain = new Terrain(this)
        this.add(this.terrain);


        // if(parent.state.displayClouds == true) {
        //   this.cloud1 = new Cloud(parent,0);
        //   this.add(this.cloud1);

        //   this.cloud2 = new Cloud(parent,1);
        //   this.add(this.cloud2);
        // }

        // if(parent.state.displayOrbs == true) {
        //   this.orb1 = new Orb(parent);
        //   this.add(this.orb1);
        // }
    }


    updateNoise() {
        this.terrain.updateNoise();
    }

    updateTerrainGeo() {
        this.terrain.updateTerrainGeo();
    }

    setChunkPosition(x, y, z) {
        this.position.x = x;
        this.position.z = z;
        this.position.y = y;
        this.updateMatrix();
    }

    disposeOf() {
        this.terrain.disposeOf()
        this.remove(this.terrain)

        //   if(this.cloud1 != null) {
        //     this.cloud1.disposeOf()
        //     this.remove(this.cloud1)
        //   }

        //   if(this.cloud2 != null) {
        //     this.cloud2.disposeOf()
        //     this.remove(this.cloud2)
        //   }

        //   if(this.orb1 != null) {
        //     this.orb1.disposeOf()
        //     this.remove(this.orb1)
        //   }


        return this.terrain.disposeOf()
    }

}

export default Chunk;
