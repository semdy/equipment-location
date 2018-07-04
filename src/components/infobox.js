/**
 * @file 信息窗口组件
 * @author kyle(hinikai@gmail.com)
 */
import { render } from 'react-dom';
import Component from './component';
import BMap from 'BMap';
import CustomInfoBox from './CustomInfoBox';

export default class Infobox extends Component {
  constructor(args) {
    super(args);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    this.initialize();
  }

  componentDidMount() {
    this.initialize();
  }

  componentWillUnmount() {
    this.destroy();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {position, isOpen, width, height, title, message } = this.props;

    if (
         isOpen !== nextProps.isOpen
      || width !== nextProps.width
      || height !== nextProps.height
      || title !== nextProps.title
      || message !== nextProps.message
    ) {
      return true;
    }

    for(let i in nextProps.position) {
      if (nextProps.position[i] !== position[i]) {
        return true;
      }
    }

    return false
  }

  destroy() {
    if (this.infoWindow) {
      if (this.props.children) {
        this.infoWindow.close();
      } else {
        this.props.map.closeInfoWindow();
      }

      this.infoWindow = null;
    }
  }

  get options() {
    return [
      'boxStyle',
      'boxClass',
      'closeIconMargin',
      'enableAutoPan',
      'align',
      'offset',
      'width',
      'height',
      'maxWidth',
      'title',
      'enableCloseOnClick',
      'enableMessage',
      'message'
    ];
  }

  get events() {
    return [
      'close',
      'open',
      'maximize',
      'restore',
      'clickclose'
    ];
  }

  initialize() {
    const { map, children, isOpen } = this.props;
    if (!map) {
      return;
    }

    this.destroy();

    if (children) {
      this.contentDom = document.createElement('div');
      render(<div>{children}</div>, this.contentDom);
      this.infoWindow = new CustomInfoBox(map, this.contentDom, this.getOptions(this.options));
      if (isOpen) {
        this.infoWindow.open(new BMap.Point(this.props.position.lng, this.props.position.lat));
      }
    } else {
      this.infoWindow = new BMap.InfoWindow(this.props.text, this.getOptions(this.options));
      this.bindEvent(this.infoWindow, this.events);
      if (isOpen) {
        map.openInfoWindow(this.infoWindow, new BMap.Point(this.props.position.lng, this.props.position.lat));
      }
    }
  }

}
