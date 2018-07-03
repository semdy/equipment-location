import {Component} from 'react';

let reqAE = function (callback) {
  return setTimeout(callback, 1000 / 60);
};

let cancelAE = function (id) {
  return clearTimeout(id);
};

function CircEaseInOut(p) {
  return ((p*=2) < 1) ? -0.5 * (Math.sqrt(1 - p * p) - 1) : 0.5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
}

function Linear(t) {
  return t;
}

let Tween = function(target, toAttrs, duration, ease, onUpdate, callback){
  let startTime = Date.now();
  let reqId;
  let originAttrs = Object.assign({}, target);

  function run(){
    reqId = reqAE(run);
    let percent = (Date.now() - startTime)/duration;
    if( percent >= 1 ) percent = 1;

    for(let i in toAttrs){
      target[i] = originAttrs[i] + (toAttrs[i] - originAttrs[i])*(ease||Linear)(percent);
    }

    onUpdate(percent);

    if( percent === 1 ){
      cancelAE(reqId);
      callback && callback();
    }
  }

  run();
};

let Circle = function(canvasDom, options = {}){
  this.cavansDom = canvasDom;
  this.context = canvasDom.getContext('2d');
  this.options = Object.assign({}, options);

  for(let i in this.options){
    Object.defineProperty(this, i, {
      set (newValue) {
        if( this.options[i] !== newValue ) {
          if( i === 'percent' ){
            Tween(this.options, {percent: newValue}, 600, Linear, this.render.bind(this));
          }
          else {
            this.options[i] = newValue;
            this.render();
          }
        }
      }
    });
  }

  this.render();
};

Circle.prototype = {
  render(){
    let context = this.context;
    let options = this.options;
    let canvas = this.cavansDom;
    let borderWidth = options.borderWidth;
    let radius = options.radius;
    let width = radius*2 + borderWidth;
    let height = width;

    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);

    context.lineWidth = borderWidth;

    context.beginPath();
    context.strokeStyle = options.shadowColor;
    context.arc(radius + borderWidth/2, radius + borderWidth/2, radius, 0, 2 * Math.PI, false);
    context.stroke();

    context.save();
    context.translate(width/2, height/2);
    context.rotate(-90 * Math.PI / 180);
    context.translate(-width/2, -height/2);
    context.beginPath();
    context.strokeStyle = options.color;
    context.lineCap = 'round';
    context.arc(radius + borderWidth/2, radius + borderWidth/2, radius, 0, 2 * Math.PI*options.percent, false);
    context.stroke();
    context.restore();
  }
};

export default class CanvasApp extends Component {
  static defaultProps = {
    percent: 0,
    radius: 70,
    borderWidth: 12,
    shadowColor: '#ccc',
    color: '#4472c4'
  };
  shouldComponentUpdate(nextProps, nextState) {
    const { percent, radius, borderWidth, shadowColor, color } = this.props;

    if (
         percent !== nextProps.percent
      || radius !== nextProps.radius
      || borderWidth !== nextProps.borderWidth
      || shadowColor !== nextProps.shadowColor
      || color !== nextProps.color
    ) {
      return true;
    }

    return false
  }
  componentDidUpdate() {
    const {percent, borderWidth, radius} = this.props;
    this.circle.percent = percent;
    this.circle.borderWidth = borderWidth;
    this.circle.radius = radius;
  }
  componentDidMount() {
    const{ percent, radius, borderWidth, shadowColor, color } = this.props;
    this.circle = new Circle(this.refs.canvas, {percent, radius, borderWidth, shadowColor, color});
  }
  render() {
    return (
      <div style={{position: 'relative', ...this.props.style}} className={this.props.className}>
        <canvas width={120} height={120} ref='canvas' />
        {this.props.children}
      </div>
    )
  }
}
