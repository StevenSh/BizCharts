import React, { useEffect } from 'react';
import _isFunction from '@antv/util/lib/is-function';
import useChart from '../../hooks/useChartView';

export interface IInteractionProps extends React.Props<any> {
  type: string;
  config?: object;
}

export default function Interaction(props: IInteractionProps) {
  const chart = useChart();
  const { type, config } = props;

  // @ts-ignore
  useEffect(() => {
    chart.interaction(type, config);
    if (_isFunction(props.children)) {
      const res = props.children(chart);
      return React.isValidElement(res) ? res : null;
    }
    return () => {
      chart.removeInteraction(type);
    }
  });

  return null;
}
