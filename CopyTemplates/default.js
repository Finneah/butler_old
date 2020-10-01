import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

import GlobalStyles from '../style/GlobalStyles';
import {connect} from 'react-redux';

class CLASS_NAME extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <View style={GlobalStyles.mainContainer}>
        <Text>{'CLASS_NAME'}</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({});
// const mapStateToProps = state => {};

// const mapDispatchToProps = dispatch => {
//   return {};
// };

export default connect()(CLASS_NAME);
//   mapStateToProps,
//   mapDispatchToProps,
