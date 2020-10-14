import React, {Component} from 'react';
import {View} from 'react-native';
import Svg, {G, Path} from 'react-native-svg';
/**
 * This is a description of the ButlerIcon constructor function.
 * @class ButlerIcon
 * @classdesc This is a description of the ButlerIcon class.
 */
class ButlerIcon extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (
            <Svg
                height={this.props.size ? this.props.size : '100%'}
                style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;"
                xmlns="http://www.w3.org/2000/svg"
                width={this.props.size ? this.props.size : '100%'}
                version="1.1"
                viewBox="0 0 1024 1024"
            >
                <G id="Layer 2">
                    <Path
                        stroke="#000000"
                        stroke-width="5"
                        d="M474.545+225.778C474.097+192.986+501.089+180.474+533.833+180.026C566.577+179.578+592.672+191.365+593.121+224.156C593.569+256.947+566.577+269.731+533.833+270.179C501.089+270.627+474.994+258.569+474.545+225.778Z"
                        fill="#000000"
                        stroke-linecap="round"
                        opacity="1"
                        stroke-linejoin="round"
                    />
                    <Path
                        stroke="#000000"
                        stroke-width="5"
                        d="M494.124+188.631L443.067+163.103C443.067+163.103+340.288+133.629+323.803+163.103C307.317+192.576+303.576+243.245+323.803+282.367C344.029+321.488+443.067+282.367+443.067+282.367L490.007+258.897"
                        fill="#000000"
                        stroke-linecap="round"
                        opacity="1"
                        stroke-linejoin="round"
                    />
                    <Path
                        stroke="#000000"
                        stroke-width="5"
                        d="M575.772+188.68L626.933+163.099C626.933+163.099+729.712+133.626+746.197+163.099C762.683+192.573+766.424+243.242+746.197+282.364C725.971+321.485+626.933+282.364+626.933+282.364L577.93+257.862"
                        fill="#000000"
                        stroke-linecap="round"
                        opacity="1"
                        stroke-linejoin="round"
                    />
                </G>
                <G id="Layer 3">
                    <Path
                        stroke="#000000"
                        stroke-width="5"
                        d="M765.753+117.74L939.293+292.577L829.031+416.236L910.216+512L558.309+1003.79C558.309+1003.79+723.368+617.286+764.967+395.774C806.566+174.261+765.753+117.74+765.753+117.74Z"
                        fill="#000000"
                        stroke-linecap="round"
                        opacity="1"
                        stroke-linejoin="round"
                    />
                    <Path
                        stroke="#000000"
                        stroke-width="5"
                        d="M311.458+123.26L139+297.007L248.575+419.896L167.896+515.064L517.611+1003.79C517.611+1003.79+353.579+619.693+312.24+399.561C270.9+179.429+311.458+123.26+311.458+123.26Z"
                        fill="#000000"
                        stroke-linecap="round"
                        opacity="1"
                        stroke-linejoin="round"
                    />
                </G>
            </Svg>
        );
    }
}
export default ButlerIcon;
