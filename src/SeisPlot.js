import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import useWindowDimensions from './useWindowDimensions';
import './App.css';

function SeisPlot(props) {
  const range = props.range;
  const [p, onPchange] = useState(range[0]);
  const [s, onSchange] = useState(range[1]);

  const { width } = useWindowDimensions();

  const layout = {
    xaxis: {range: range, showline: true, mirror: 'allticks'},
    hovermode: 'closest',
    showlegend: false,
    width: width * 0.99, 
    height: 200,
    yaxis: {domain: [0, 0.33], fixedrange: true, tickfont: {size: 10}},
    yaxis2: {domain: [0.33, 0.66], fixedrange: true, tickfont: {size: 10}, title: {text: props.seis[0]?.stationCode, font: {size: 10}}},
    yaxis3: {domain: [0.66, 1], fixedrange: true, tickfont: {size: 10}, zeroline: false},
    margin: {l: 40, r: 0, b: 20, t: 1},
    shapes: [
      {
        yref: 'paper',
        opacity: 0.33,
        x0: p,
        y0: 0,
        x1: p,
        y1: 1,
      },
      {
        yref: 'paper',
        opacity: 0.33,
        x0: s,
        y0: 0,
        x1: s,
        y1: 1,
      }
    ],
    annotations: [
      {
        x: p,
        y: 0.5,
        xref: 'x',
        yref: 'paper',
        text: 'P',
        showarrow: false,
        font: { size: 24 }
      },
      {
        x: s,
        y: 0.5,
        xref: 'x',
        yref: 'paper',
        text: 'S',
        showarrow: false,
        font: { size: 24 }
      }
    ]
  }
  const [plot, setPlot] = useState(layout);

  useEffect(() => {
    plot.xaxis.range = range;
    setPlot(plot);
  }, [plot, range]);
  
  function merge(segmentArray) {
    console.log('merged');
    let tmp = [];
    for (let i = 1; i < segmentArray.length; i = i + 2) {
      tmp = tmp.concat(Array.from(segmentArray[i].y));
    }
    return tmp;
  }

  const data = props.seis.map(trace => {
    return {
      name: trace.channelCode, 
      x: props.dates, 
      y: trace._segmentArray.length === 1 ? trace.y : merge(trace._segmentArray),
      line: {
        width: 1
      }
    }
  })
  data[1].yaxis = 'y2';
  data[2].yaxis = 'y3';

  function changePoint(point, index) {
    plot.shapes[index].x0 = point
    plot.shapes[index].x1 = point
    plot.annotations[index].x = point
    setPlot(plot);
  }

  return (
    <Plot
    onRelayout={(e) => {props.setRange([e['xaxis.range[0]'], e['xaxis.range[1]']])}}    
    onClick={(e) => {
      let point = e.points[0].x;
      if (e.event.button === 0) {
        onPchange(point);
        changePoint(point, 0)
      }
      else if (e.event.button === 2) {
        onSchange(point);
        changePoint(point, 1)
      }
    }}
    data={data}
    layout={plot}
    config={{ 
      modeBarButtonsToRemove: ['toImage', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
      displaylogo: false,
      doubleClick: false
    }}
  />
  )
}

export default SeisPlot;