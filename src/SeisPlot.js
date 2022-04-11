import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import useWindowDimensions from './useWindowDimensions';

function SeisPlot(props) {
  const [p, onPchange] = useState(props.start);
  const [s, onSchange] = useState(props.end);

  const { width } = useWindowDimensions();

  const trace1 = {
    name: 'HHE',
    x: props.dates,
    y: props.seis[0]?.y,
  }
  const trace2 = {
    name: 'HHN',
    x: props.dates,
    y: props.seis[1]?.y,
    yaxis: 'y2'
  }
  const trace3 = {
    name: 'HHZ',
    x: props.dates,
    y: props.seis[2]?.y,
    yaxis: 'y3',
  }
  const data = [trace1, trace2, trace3];

  const layout = {
    xaxis: {range: [props.start, props.end]},
    hovermode: 'x',
    showlegend: false,
    width: width * 0.99, 
    height: 200, 
    yaxis: {domain: [0, 0.33], fixedrange: true},
    yaxis2: {domain: [0.33, 0.66], fixedrange: true, title: {text: props.seis[0]?.stationCode}},
    yaxis3: {domain: [0.66, 1], fixedrange: true},
    margin: {
      l: 50,
      r: 0,
      b: 0,
      t: 0,
    },
    shapes: [
      {
        yref: 'paper',
        x0: p,
        y0: 0,
        x1: p,
        y1: 1,
        line: { width: 1 }
      },
      {
        yref: 'paper',
        x0: s,
        y0: 0,
        x1: s,
        y1: 1,
        line: { width: 1 }
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
  return (
    props.seis.length === 0 ? '' :
    <Plot
    onClick={(e) => {
      let point = e.points[0].x;
      if (e.event.button === 0) {
        onPchange(point);
        setPlot(prevState => ({
          ...prevState, 
          shapes: [{...prevState.shapes[0], x0: point, x1: point}, prevState.shapes[1]],
          annotations: [{...prevState.annotations[0], x: point}, prevState.annotations[1]]
        }));
      }
      else if (e.event.button === 2) {
        onSchange(point);
        setPlot(prevState => ({
          ...prevState, 
          shapes: [prevState.shapes[0], {...prevState.shapes[1], x0: point, x1: point}],
          annotations: [prevState.annotations[0], {...prevState.annotations[1], x: point}]
        }));
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