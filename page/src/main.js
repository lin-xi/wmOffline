import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import Index from './pages/Index';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// TapEventPlugin.extractEvents();

const App = React.createClass({
    mixins: [PureRenderMixin],
    render(){
        return (
            <MuiThemeProvider>
                <Index/>
            </MuiThemeProvider>
        );
    }
});

ReactDOM.render(
    <App/>,
    document.querySelector('#app')
);
