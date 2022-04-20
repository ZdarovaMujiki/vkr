import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import { miniseed, filter } from 'seisplotjs';
import SeisPlot from './SeisPlot';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, ButtonGroup} from 'react-bootstrap';

function App() {
  const [start, onStartChange] = useState(new Date('2022-03-31T18:00:00.000Z'));
  const [end, onEndChange] = useState(new Date('2022-03-31T18:30:00.000Z'));
  // const [seis, onSeismogramsChange] = useState([]);
  const [dates, setDates] = useState([]);
  const [range, setRange] = useState([start, end]);
  const [seisMap, setSeis] = useState(new Map());
  const updateMap = (key, value) => {
    setSeis(map => new Map(map.set(key, value)));
  }

  const chebykin = filter.createChebyshevI(4, 0.5, filter.LOW_PASS, 0, 1, 0.005); 

  function recountDates() {
    let dates = [];
    for (let i = 0; i < (end - start) / 5; ++i) {
      dates.push(new Date(start.getTime() + 5 * i));
    }
    setDates(dates);
    console.log(dates.length);
    setRange([start, end]);
  }

  function getStations(network) {
    // onSeismogramsChange([]);
    let url = 'http://84.237.89.72:8080/fdsnws/station/1/query?format=text' + (network === '' ? '' : '&net=' + network);
    fetch(url)
    .then(response => response.text())
    .then(text => text.split('\n').slice(1, -1))
    .then(stations => stations.forEach(station => {
      let name = station.split('|')[1];
      updateMap(name, []);
      getDataFromStation(name);
    } ));
    recountDates();
  }

  async function getDataFromStation(station) {
    let url = 'http://84.237.89.72:8080/fdsnws/dataselect/1/query';
    let query = `?start=${start.toISOString()}&end=${end.toISOString()}&station=${station}`;
    let request = url + query;

    const response = await fetch(request);
    const records = miniseed.parseDataRecords(await response.arrayBuffer());
    let seismograms = miniseed.seismogramPerChannel(records);
    console.log(seismograms);
    seismograms = seismograms.map(seismogram => filter.applyFilter(chebykin, seismogram));
    console.log(seismograms[0]);
    updateMap(station, seismograms);
  }

  return (
    <div>
      <div className='controlls'>
        <DateTimePicker onChange={onStartChange} value={start} format={'y-MM-dd hh:mm:ss'}/>
        <DateTimePicker onChange={onEndChange} value={end} format={'y-MM-dd hh:mm:ss'}/>
        <ButtonGroup>
          <Button id={'8b'} value={'8b'} variant='outline-success' onClick={(e) => getStations(e.currentTarget.value)}>8b</Button>
          <Button id={'KA'} value={'KA'} variant='outline-success' onClick={(e) => getStations(e.currentTarget.value)}>KA</Button>
        </ButtonGroup>
      </div>
      <div className='plots'>
        {Array.from(seisMap).map(([k, v]) => {return v.length > 0 ? <SeisPlot range={range} setRange={setRange} seis={v} dates={dates}/> : <div/>})}
      </div>
    </div>
  );
}

export default App;