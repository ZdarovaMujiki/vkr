import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import useWindowDimensions from './useWindowDimensions';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';

function SeisPlot(props) {
  const [p, onPchange] = useState(props.start);
  const [s, onSchange] = useState(props.end);

  const [currentLine, setLine] = useState('P');
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
    title: props.seis[0]?.stationCode,
    xaxis: {range: [props.start, props.end]},
    hovermode: 'x',
    showlegend: false,
    width: width * 0.98, 
    height: 600, 
    yaxis: {domain: [0, 0.33], title: {text: 'HHE'}},
    yaxis2: {domain: [0.33, 0.66], title: {text: 'HHN'}},
    yaxis3: {domain: [0.66, 1], title: {text: 'HHZ'}},
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
    <div>
      <Plot
      on
        onClick={(e) => {
          let point = e.points[0].x;
          if (currentLine === 'P') {
            onPchange(point);
            setPlot(prevState => ({
              ...prevState, 
              shapes: [{...prevState.shapes[0], x0: point, x1: point}, prevState.shapes[1]],
              annotations: [{...prevState.annotations[0], x: point}, prevState.annotations[1]]
            }));
          }
          else {
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
      />
      <div>
        <ButtonGroup>
          <ToggleButton id={`radio-${props.seis[0]?.stationCode}-1`} type='radio' value={'P'} checked={currentLine === 'P'} variant={'outline-success'} onChange={(e) => setLine(e.currentTarget.value)}>P</ToggleButton>
          <ToggleButton id={`radio-${props.seis[0]?.stationCode}-2`} type='radio' value={'S'} checked={currentLine === 'S'} variant={'outline-success'} onChange={(e) => setLine(e.currentTarget.value)}>S</ToggleButton>
        </ButtonGroup>
        <div> P: {p.toString()} </div>
        <div> S: {s.toString()} </div>
      </div>
    </div>
  )
}

export default SeisPlot;