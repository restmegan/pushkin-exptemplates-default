import React from 'react';
import pushkinClient from 'pushkin-client';
import jsPsych from 'pushkin-jspsych';
import { withRouter } from 'react-router-dom';

const pushkin = new pushkinClient();
window.jsPsych = jsPsych;

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loading: true, experimentComplete: false };
  }

  componentDidMount() {
    this.startExperiment();
  }

  async startExperiment() {
    this.props.history.listen(jsPsych.endExperiment);

    jsPsych.data.addProperties({user_id: this.props.userID}); //See https://www.jspsych.org/core_library/jspsych-data/#jspsychdataaddproperties
    await pushkin.connect('/api/newexp');
    await pushkin.prepExperimentRun(this.props.userID);
    await pushkin.loadScripts([
      'https://cdn.jsdelivr.net/gh/jspsych/jsPsych@6.0.4/plugins/jspsych-html-button-response.js',
      'https://cdn.jsdelivr.net/gh/jspsych/jsPsych@6.0.4/plugins/jspsych-instructions.js',
      'https://cdn.jsdelivr.net/gh/jspsych/jsPsych@6.0.4/plugins/jspsych-survey-text.js'
    ]);
    const stimuli = await pushkin.getAllStimuli(this.props.userID);
    const timeline = pushkin.setSaveAfterEachStimulus(stimuli);
    await jsPsych.init({
      display_element: document.getElementById('jsPsychTarget'),
      timeline: timeline,
      on_finish: this.endExperiment.bind(this)
    });

    this.setState({ loading: false });
  }

  endExperiment() {
    this.setState({ experimentComplete: true });
    pushkin.endExperiment(this.props.userID);
  }

  render() {
    const { match } = this.props;

    return (
      <div>
        {this.state.loading && <h1>Loading...</h1>}
        <div id="jsPsychTarget" />
      </div>
    );
  }
}

export default Profile;
