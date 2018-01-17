import React from 'react';
import PropTypes from 'prop-types';

export function connect() {
  
}

class Provider extends React.Component {
 static childContextTypes = {
   store: PropTypes.object
 }
}
