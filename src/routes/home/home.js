import React, {Component} from 'react';
import {connect} from 'dva';
import BMap from 'BMap';
import {
  Spinner,
  Icon,
  Map,
  Marker,
  InfoBox,
  MarkerGroup,
  PercentageCircle
} from '../../components';
import classnames from 'classnames';
import {Input, Select, Popover} from 'antd';
import styles from './home.less';

const Option = Select.Option;
const Search = Input.Search;

function handleChange(value) {
  console.log(`selected ${value}`);
}

@connect(({home, loading}) => ({
    home,
    loading: loading.global,
  }),
  dispatch => ({
    addTodo: () => dispatch({
      type: 'home/fetch',
    }),
  })
)
export default class Home extends Component {

  state = {
    markers: [
      {
        position: {lng: 119.0874, lat: 36.665582},
        icon: "simple_red"
      }
    ],
    infobox: {
      position: {lng: 116.402544, lat: 39.928216},
      isOpen: false
    }
  };

  handleMarkerOver(position) {
    this.setState({
      infobox: {
        position: position,
        isOpen: true
      }
    });
  }

  handleMarkerMouseout() {
    this.setState({
      infobox: {
        isOpen: false
      }
    });
  }

  componentDidMount() {
    this.props.addTodo();
  }

  render() {
    const {statusList} = this.props.home;
    const {markers, infobox} = this.state;
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={classnames(styles.headerInner, 'clearfix')}>
            <div className={classnames('fn-left', styles.headerLeft)}>
              <img className={styles.logo} src={require("../../assets/img/logo.jpeg")} alt=""/>
              <h1>硬件定位系统</h1>
            </div>
            <div className={classnames('fn-right', styles.headerRight)}>
              <Select defaultValue="0"
                      style={{width: 120, marginRight: 8}}
                      onChange={handleChange}
              >
                <Option value="0">目的地</Option>
                <Option value="1">设备id</Option>
              </Select>
              <Search
                placeholder="请输入查询关键字"
                onSearch={value => console.log(value)}
                style={{width: 200}}
              />
            </div>
          </div>
        </header>

        <div className={styles.main}>
          <div className={styles.statusContainer}>
            <h2 className={styles.statusTitle}>
              数据统计
            </h2>
            <div className={styles.statusBd}>
              {
                statusList.map((item, i) => (
                  <div key={i} className={styles.statusItem}>
                    <PercentageCircle
                      radius={55}
                      percent={item.percent}
                      color={item.color}
                      className={styles.circleWrap}
                    >
                      <span className={styles.circleLabel}>
                        {item.num}
                      </span>
                    </PercentageCircle>
                    <h4>
                      {item.name}
                    </h4>
                  </div>
                ))
              }
            </div>
          </div>
          <div className={styles.mapContainer}>
            <Map
              center={{
                lng: 105.403119,
                lat: 38.028658
              }}
            >
              <MarkerGroup>
                {
                  markers.map((marker, i) => (
                    <Marker
                      key={i}
                      position={marker.position}
                      icon={marker.icon}
                      events={{
                        mouseover: this.handleMarkerOver.bind(this, marker.position),
                        mouseout: this.handleMarkerMouseout.bind(this)
                      }}
                    >
                    </Marker>
                  ))
                }
              </MarkerGroup>
              <InfoBox
                position={infobox.position}
                isOpen={infobox.isOpen}
                offset={
                  new BMap.Size(-88, 35)
                }
              >
                <div className="ant-popover ant-popover-placement-top map-popover" style={{position: 'relative'}}>
                  <div className="ant-popover-content">
                    <div className="ant-popover-arrow">
                    </div>
                    <div className="ant-popover-inner">
                      <div>
                        <div className="ant-popover-title">Title</div>
                        <div className="ant-popover-inner-content">
                          <a>Close</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </InfoBox>
            </Map>
          </div>

          <Popover visible={false}>
          </Popover>

          <div className={styles.toolWrap}>
            <div className={styles.topTool}>
              <Icon name='arrow-down-ob' style={{marginRight: 5}} />
              <span>工具箱号</span>
            </div>
            <div className={styles.sideTool}>
              <Icon name='angle-right' />
            </div>
            <div className={styles.toolPanel}>
              <div className={classnames(styles.panelCommon, styles.toolPanelHd)}>
                工具箱号：A001
              </div>
              <div className={classnames(styles.panelCommon, styles.toolItem)}>
                <p>最近定位时间：2018/6/21 17:07</p>
                <p>任务状态：执行</p>
                <p>工具状态：可调配</p>
                <p>设备状态: 正常</p>
              </div>

              <div className={classnames(styles.panelCommon, styles.toolItem)}>
                <p>起始位置：上海第一人民医院</p>
                <p>经过位置：上海第一人民医院 上海第二人民医院</p>
                <p>当前位置：上海市徐汇区龙漕路路</p>
                <p>到达位置：上海市现金医院</p>
              </div>

              <div className={classnames(styles.panelCommon, styles.toolItem)}>
                <h4>工具箱数：6</h4>
                <div>
                  <p>工具箱A：3</p>
                  <p>工具箱B：3</p>
                  <p>工具箱C：3</p>
                </div>
              </div>
            </div>

            <div className={styles.bottomTool}>
              <Icon name='arrow-up-ob' style={{marginRight: 5}}/>
              <span>隐藏</span>
            </div>

          </div>

        </div>

      </div>
    )
  }
}

Home.propTypes = {};
