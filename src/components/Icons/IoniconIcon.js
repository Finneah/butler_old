import React, {Component} from 'react';
import {Platform, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {Icon} from 'react-native-elements';
import GlobalColors from '../../style/GlobalColors';
Ionicons.loadFont();
/**
 * This is a description of the IoniconIcon constructor function.
 * @class IoniconIcon
 * @classdesc This is a description of the IoniconIcon class.
 */
class IoniconIcon extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }
  render() {
    return (
      <Icon
        color={this.props.color ? this.props.color : GlobalColors.mainColor}
        size={25}
        style={styles.icon}
        reverse={this.props.reverse}
        reverseColor={this.props.reverseColor}
        {...this.props}
        name={Platform.select({
          ios: 'ios-' + this.props.name,
          android: 'md-' + this.props.name,
        })}
        type="ionicon"
        onPress={this.props.onPress}
      />
    );
  }
}
const styles = StyleSheet.create({
  icon: {paddingLeft: 20},
});
export default IoniconIcon;
