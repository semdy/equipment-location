/**
 * @file 地图的全景图控件
 */

import Control from './control';
import BMap from 'BMap';

export default class PanoramaControl extends Control {
    constructor(args) {
        super(args);
    }

    get options() {
        return ['anchor', 'offset'];
    }

    getControl() {
        return new BMap.PanoramaControl(this.getOptions(this.options));
    }

}
