import React from 'react';
import ReactDom from 'react-dom';
import Startup from './startup';


const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {

    return (
        <Startup />
    );

};

ReactDom.render(<App />, mainElement);
