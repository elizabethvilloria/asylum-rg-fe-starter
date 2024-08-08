import React, { useState, useEffect } from 'react';  // Added useState and useEffect for managing state and side effects
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import CitizenshipMapAll from './Graphs/CitizenshipMapAll';
import CitizenshipMapSingleOffice from './Graphs/CitizenshipMapSingleOffice';
import TimeSeriesAll from './Graphs/TimeSeriesAll';
import OfficeHeatMap from './Graphs/OfficeHeatMap';
import TimeSeriesSingleOffice from './Graphs/TimeSeriesSingleOffice';
import YearLimitsSelect from './YearLimitsSelect';
import ViewSelect from './ViewSelect';
import axios from 'axios';
import { resetVisualizationQuery } from '../../../state/actionCreators';
// Removed test_data import as we are now fetching data from an API
// import test_data from '../../../data/test_data.json';
import { colors } from '../../../styles/data_vis_colors';
import ScrollToTopOnMount from '../../../utils/scrollToTopOnMount';

const { background_color } = colors;

function GraphWrapper(props) {
  const { set_view, dispatch } = props;
  let { office, view } = useParams();

  // Added states for years, data, and error
  const [years, setYears] = useState([2015, 2024]); // Default years
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Set default view to 'time-series' if not provided
  if (!view) {
    set_view('time-series');
    view = 'time-series';
  }

  // Function to fetch new data from the API and update the component state.
  async function updateStateWithNewData(years, view, office, stateSettingCallback) {
    const URL = "https://hrf-asylum-be-b.herokuapp.com/cases";
    setError(null);

    try {
      let yearResponse, citizenshipResponse;

      // Fetch data for all offices
      if (office === 'all' || !office) {
        // Promise.all to fetch data from both endpoints simultaneously
        [yearResponse, citizenshipResponse] = await Promise.all([
          axios.get(`${URL}/fiscalSummary`, {
            params: { from: years[0], to: years[1] },
          }),
          axios.get(`${URL}/citizenshipSummary`, {
            params: { from: years[0], to: years[1] },
          }),
        ]);
      } else {
        // Fetch data for a specific office
        yearResponse = await axios.get(`${URL}/fiscalSummary`, {
          params: { from: years[0], to: years[1] },
        });
        citizenshipResponse = await axios.get(`${URL}/citizenshipSummary`, {
          params: { from: years[0], to: years[1], office: office },
        });
      }

      // Extract data from the API responses
      const yearResults = yearResponse.data.yearResults || [];
      const citizenshipResults = Array.isArray(citizenshipResponse.data) ? citizenshipResponse.data : [];

      // Checking to see if both yearResults and citizenshipResults have data
      if (yearResults.length > 0 && citizenshipResults.length > 0) {
        // Update state with the new data
        stateSettingCallback(view, office, [{ yearResults, citizenshipResults }]);
      } else {
        setError('Invalid data structure');
      }
    } catch (err) {
      // Handle and log any network errors
      console.error('Network Error:', err);
      setError('Network Error');
    }
  }

  // useEffect to fetch data whenever years, view, or office changes
  useEffect(() => {
    updateStateWithNewData(years, view, office, setData);
  }, [years, view, office]);

  // Conditional rendering of the appropriate map based on view and office parameters
  let map_to_render;
  if (!office) {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesAll data={data} />;
        break;
      case 'office-heat-map':
        map_to_render = <OfficeHeatMap data={data} />;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapAll data={data} />;
        break;
      default:
        map_to_render = null;
        break;
    }
  } else {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesSingleOffice office={office} data={data} />;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapSingleOffice office={office} data={data} />;
        break;
      default:
        map_to_render = null;
        break;
    }
  }

  // Function to clear the current query in the Redux state.
  const clearQuery = (view, office) => {
    dispatch(resetVisualizationQuery(view, office));
  };

  return (
    <div
      className="map-wrapper-container"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '50px',
        backgroundColor: background_color,
      }}
    >
      <ScrollToTopOnMount />
      {error ? <div>{error}</div> : map_to_render}
      <div
        className="user-input-sidebar-container"
        style={{
          width: '300px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <ViewSelect set_view={set_view} />
        <YearLimitsSelect
          view={view}
          office={office}
          clearQuery={clearQuery}
          updateStateWithNewData={() => updateStateWithNewData(years, view, office, setData)}
        />
      </div>
    </div>
  );
}

export default connect()(GraphWrapper);
