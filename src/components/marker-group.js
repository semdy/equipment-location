/**
 * @file marker group
 */
import React from 'react';
import Component from './component';
import MarkerManager from './MarkerManager';

export default class MarkerGroup extends Component {
  static defaultProps = {
    borderPadding: 0,
    maxZoom: 19,
    isOpen: true
  };
  constructor(args) {
    super(args);
    this.state = {};
  }

  componentDidMount() {
    this.initialize();
    if (this.props.isOpen) {
      this.markerManager.showMarkers();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen) {
      setTimeout(() => {
        this.markerManager.showMarkers();
      });
    }
  }

  componentWillUnmount() {
    this.destroy();
  }

  destroy() {
    if (this.markerManager) {
      this.markerManager.clearMarkers();
      this.markerManager = null;
    }
  }

  get options() {
    return [
      'isOpen',
      'maxZoom',
      'borderPadding'
    ];
  }

  get events() {
    return [];
  }

  initialize() {
    const { map, borderPadding, maxZoom } = this.props;
    if (!map) {
      return;
    }

    this.destroy();

    this.markerManager = new MarkerManager(map, {
      borderPadding,
      maxZoom
    });
  }

  render() {

    const {children, map} = this.props;

    if (!children || !map) return null;

    return React.Children.map(children, child => {

      if (!child) {
        return;
      }

      if (typeof child.type === 'string') {
        return child;
      } else {
        return React.cloneElement(child, {
          map: map,
          mgr: this.markerManager
        });
      }

    })

  }

}
