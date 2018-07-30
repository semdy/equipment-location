/**
 * @file 折线覆盖物
 * @author kyle(hinikai@gmail.com)
 */

import Graphy from './graphy';
import BMap from 'BMap';

export default class App extends Graphy {

    constructor(args) {
        super(args);
    }

    getOverlay() {

        let path = this.props.path;

        path = path.map((item) => {
            return new BMap.Point(item.position.lng, item.position.lat);
        });

        return new BMap.Polyline(path, this.getOptions(this.options));
    }

}
