import React from 'react';
import _isArray from '@antv/util/lib/is-array';
import _deepMix from '@antv/util/lib/deep-mix';
import _each from '@antv/util/lib/each';
import _get from '@antv/util/lib/get';
import _View from '@antv/g2/lib/chart/view';
import uniqueId from '@antv/util/lib/unique-id';
import { ScaleOption } from '@antv/g2/lib/interface';

import RootChartContext from '../../context/root';
import ChartViewContext from '../../context/view';
import Base, { IBaseProps } from '../../Base';
import warn from '../../utils/warning';

interface IScale {
  [field: string]: ScaleOption;
}

export interface IView extends IBaseProps {
  data?: any[];
  scale?: {
    [field: string]: ScaleOption;
  };
  region?: {
    start?: number | string;
    end?: number | string;
  };
}

class View<T extends IView = IView> extends Base<T> {
  ChartBaseClass = _View;
  name = 'view';
  static defaultProps = {
    visible: true,
  };
  getInitalConfig(): any {
    const { region, start, end } = this.props;

    warn(!start, 'start 属性将在4.1后废弃，请使用 region={{ start: {x:0,y:0}}} 替代');
    warn(!end, 'end 属性将在4.1后废弃，请使用 region={{ end: {x:0,y:0}}} 替代');

    const regionCfg = _deepMix(
      { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      { start, end },
      region,
    );
    return { region: regionCfg };
  }
  initInstance() {
    this.id = uniqueId(this.name);

    const options = this.getInitalConfig();
    this.g2Instance = this.context.chart.createView(options);
  }
  configInstance(preProps, curProps) {
    if (!this.g2Instance) {
      return;
    }
    super.configInstance(preProps, curProps);
    const nextProps = curProps || this.props;
    const { data, interactions = [], theme, limitInPlot, options, scale, ...others } = nextProps;
    if (_isArray(data)) {
      if (preProps && preProps.data) {
        this.g2Instance.changeData(data);
      } else {
        this.g2Instance.data(data);
      }
      // @ts-ignore
    } else if (data && _isArray(data.rows)) {
      // @ts-ignore
      this.g2Instance.changeData(data.rows);
      warn(
        false,
        '接口不再支持 DataView 格式数据，只支持标准 JSON 数组，所以在使用 DataSet 时，要取最后的 JSON 数组结果传入。4.1 后将删除此兼容，请使用 data={dv.rows}',
      );
    }

    // 更新比例尺
    this.g2Instance.scale({ ...scale });

    // 只支持枚举, 复杂配置用扩展配置方式
    _each(
      preProps
        ? [..._get(preProps, 'interactions', []), ..._get(nextProps, 'interactions', [])]
        : curProps.interactions,
      key => {
        if (nextProps.interactions[0]) {
          this.g2Instance.interaction(key);
        } else {
          this.g2Instance.removeInteraction(key);
        }
      },
    );
    // 主题更新
    if (preProps && preProps.theme !== theme) {
      this.g2Instance.theme(theme);
    }

    if (preProps && preProps.options !== options) {
      this.g2Instance.updateOptions(options);
    }

    this.g2Instance.limitInPlot = limitInPlot;
  }

  // @ts-ignore
  render(checked) {
    if(!checked) {
      this.checkInstanceReady();
    }
    return (
      <ChartViewContext.Provider value={this.g2Instance}>
        <>{this.props.children}</>
      </ChartViewContext.Provider>
    );
  }
}

View.contextType = RootChartContext;

export default View;
