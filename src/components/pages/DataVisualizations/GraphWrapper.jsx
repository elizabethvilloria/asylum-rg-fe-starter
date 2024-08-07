import React from 'react';
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
// commented out
// import test_data from '../../../data/test_data.json';
import { colors } from '../../../styles/data_vis_colors';
import ScrollToTopOnMount from '../../../utils/scrollToTopOnMount';

const { background_color } = colors;

function GraphWrapper(props) {
  const { set_view, dispatch } = props;
  let { office, view } = useParams();
  if (!view) {
    set_view('time-series');
    view = 'time-series';
  }
  let map_to_render;
  if (!office) {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesAll />;
        break;
      case 'office-heat-map':
        map_to_render = <OfficeHeatMap />;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapAll />;
        break;
      default:
        break;
    }
  } else {
    switch (view) {
      case 'time-series':
        map_to_render = <TimeSeriesSingleOffice office={office} />;
        break;
      case 'citizenship':
        map_to_render = <CitizenshipMapSingleOffice office={office} />;
        break;
      default:
        break;
    }
  }

  // Function to fetch new data from the API and update the component state.
  async function updateStateWithNewData(years, view, office, stateSettingCallback) {

    const URL = "https://hrf-asylum-be-b.herokuapp.com/cases";

    // Check if the office parameter is 'all' or not provided.
    if (office === 'all' || !office) {

      Promise.all([
        await axios.get(`${URL}/fiscalSummary`, {

          params: {
            from: years[0],
            to: years[1],
          },
        }),

        await axios.get(`${URL}/citizenshipSummary`, {

          params: {
            from: years[0],
            to: years[1],
            office: office,
          },
        })
      ])
        .then(([callA, callB]) => {
          // Getting data from the response of the first request.
          const yearResults = callA.data.yearResults;

          // Getting data from the response of the second request.
          const citizenshipResults = callB.data;

          // Combining the obtained data.
          const combinedData = [{yearResults, citizenshipResults}];

          // Update the component state with the new data.
          stateSettingCallback(view, office, [combinedData][0]);
        })
        .catch(err => {
          // Log any errors encountered during the data fetching process.
          console.error(err);
        });
        }
  }
      // axios
      //   .get(process.env.REACT_APP_API_URI, {
      //     // mock URL, can be simply replaced by `${Real_Production_URL}/summary` in prod!
      //     params: {
      //       from: years[0],
      //       to: years[1],
      //     },
      //   })
      //   .then(result => {
      //     stateSettingCallback(view, office, test_data); // <-- `test_data` here can be simply replaced by `result.data` in prod!
      //   })
      //   .catch(err => {
      //     console.error(err);
      //   });
  //   } else {
  //     axios
  //       .get(process.env.REACT_APP_API_URI, {
  //         // mock URL, can be simply replaced by `${Real_Production_URL}/summary` in prod!
  //         params: {
  //           from: years[0],
  //           to: years[1],
  //           office: office,
  //         },
  //       })
  //       .then(result => {
  //         stateSettingCallback(view, office, test_data); // <-- `test_data` here can be simply replaced by `result.data` in prod!
  //       })
  //       .catch(err => {
  //         console.error(err);
  //       });
  //   }
  // }

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
      {map_to_render}
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
          updateStateWithNewData={updateStateWithNewData}
        />
      </div>
    </div>
  );
}

export default connect()(GraphWrapper);