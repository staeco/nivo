import React, { Fragment, Component } from 'react';
import { TransitionMotion, spring } from 'react-motion';
import { defsPropTypes, noop, withTheme, withDimensions, withMotion, getAccessorFor, getLabelGenerator, bindDefs, Container, CartesianMarkers, SvgWrapper, getRelativeCursor, isCursorInRect, ResponsiveWrapper } from '@nivo/core';
import { axisPropType, Grid, Axes, renderGridLinesToCanvas, renderAxesToCanvas } from '@nivo/axes';
import { LegendPropShape, BoxLegendSvg, renderLegendToCanvas } from '@nivo/legends';
import min from 'lodash/min';
import max from 'lodash/max';
import range from 'lodash/range';
import { scaleBand, scaleLinear } from 'd3-scale';
import flattenDepth from 'lodash/flattenDepth';
import { stack, stackOffsetDiverging } from 'd3-shape';
import _uniqBy from 'lodash/uniqBy';
import setDisplayName from 'recompose/setDisplayName';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withPropsOnChange from 'recompose/withPropsOnChange';
import pure from 'recompose/pure';
import { inheritedColorPropType, ordinalColorsPropType, colorPropertyAccessorPropType, getOrdinalColorScale, getInheritedColorGenerator } from '@nivo/colors';
import PropTypes from 'prop-types';
import { BasicTooltip } from '@nivo/tooltip';
import { useAnnotations, Annotation } from '@nivo/annotations';

var getIndexedScale = function getIndexedScale(data, getIndex, range, padding) {
  return scaleBand().rangeRound(range).domain(data.map(getIndex)).padding(padding);
};

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }
function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }
var getGroupedScale = function getGroupedScale(data, keys, _minValue, _maxValue, range) {
  var allValues = data.reduce(function (acc, entry) {
    return [].concat(_toConsumableArray(acc), _toConsumableArray(keys.map(function (k) {
      return entry[k];
    })));
  }, []);
  var maxValue = _maxValue;
  if (maxValue === 'auto') {
    maxValue = max(allValues);
  }
  var minValue = _minValue;
  if (minValue === 'auto') {
    minValue = min(allValues);
    if (minValue > 0) minValue = 0;
  }
  return scaleLinear().rangeRound(range).domain([minValue, maxValue]);
};
var generateVerticalGroupedBars = function generateVerticalGroupedBars(_ref) {
  var data = _ref.data,
      getIndex = _ref.getIndex,
      keys = _ref.keys,
      minValue = _ref.minValue,
      maxValue = _ref.maxValue,
      reverse = _ref.reverse,
      width = _ref.width,
      height = _ref.height,
      getColor = _ref.getColor,
      _ref$padding = _ref.padding,
      padding = _ref$padding === void 0 ? 0 : _ref$padding,
      _ref$innerPadding = _ref.innerPadding,
      innerPadding = _ref$innerPadding === void 0 ? 0 : _ref$innerPadding;
  var xScale = getIndexedScale(data, getIndex, [0, width], padding);
  var yRange = reverse ? [0, height] : [height, 0];
  var yScale = getGroupedScale(data, keys, minValue, maxValue, yRange);
  var barWidth = (xScale.bandwidth() - innerPadding * (keys.length - 1)) / keys.length;
  var yRef = yScale(0);
  var getY = function getY(d) {
    return d > 0 ? yScale(d) : yRef;
  };
  var getHeight = function getHeight(d, y) {
    return d > 0 ? yRef - y : yScale(d) - yRef;
  };
  if (reverse) {
    getY = function getY(d) {
      return d < 0 ? yScale(d) : yRef;
    };
    getHeight = function getHeight(d, y) {
      return d < 0 ? yRef - y : yScale(d) - yRef;
    };
  }
  var bars = [];
  if (barWidth > 0) {
    keys.forEach(function (key, i) {
      range(xScale.domain().length).forEach(function (index) {
        var x = xScale(getIndex(data[index])) + barWidth * i + innerPadding * i;
        var y = getY(data[index][key]);
        var barHeight = getHeight(data[index][key], y);
        if (barWidth > 0 && barHeight > 0) {
          var barData = {
            id: key,
            value: data[index][key],
            index: index,
            indexValue: getIndex(data[index]),
            data: data[index]
          };
          bars.push({
            key: "".concat(key, ".").concat(barData.indexValue),
            data: barData,
            x: x,
            y: y,
            width: barWidth,
            height: barHeight,
            color: getColor(barData)
          });
        }
      });
    });
  }
  return {
    xScale: xScale,
    yScale: yScale,
    bars: bars
  };
};
var generateHorizontalGroupedBars = function generateHorizontalGroupedBars(_ref2) {
  var data = _ref2.data,
      getIndex = _ref2.getIndex,
      keys = _ref2.keys,
      minValue = _ref2.minValue,
      maxValue = _ref2.maxValue,
      reverse = _ref2.reverse,
      width = _ref2.width,
      height = _ref2.height,
      getColor = _ref2.getColor,
      _ref2$padding = _ref2.padding,
      padding = _ref2$padding === void 0 ? 0 : _ref2$padding,
      _ref2$innerPadding = _ref2.innerPadding,
      innerPadding = _ref2$innerPadding === void 0 ? 0 : _ref2$innerPadding;
  var xRange = reverse ? [width, 0] : [0, width];
  var xScale = getGroupedScale(data, keys, minValue, maxValue, xRange);
  var yScale = getIndexedScale(data, getIndex, [height, 0], padding);
  var barHeight = (yScale.bandwidth() - innerPadding * (keys.length - 1)) / keys.length;
  var xRef = xScale(0);
  var getX = function getX(d) {
    return d > 0 ? xRef : xScale(d);
  };
  var getWidth = function getWidth(d, x) {
    return d > 0 ? xScale(d) - xRef : xRef - x;
  };
  if (reverse) {
    getX = function getX(d) {
      return d < 0 ? xRef : xScale(d);
    };
    getWidth = function getWidth(d, x) {
      return d < 0 ? xScale(d) - xRef : xRef - x;
    };
  }
  var bars = [];
  if (barHeight > 0) {
    keys.forEach(function (key, i) {
      range(yScale.domain().length).forEach(function (index) {
        var x = getX(data[index][key]);
        var y = yScale(getIndex(data[index])) + barHeight * i + innerPadding * i;
        var barWidth = getWidth(data[index][key], x);
        if (barWidth > 0) {
          var barData = {
            id: key,
            value: data[index][key],
            index: index,
            indexValue: getIndex(data[index]),
            data: data[index]
          };
          bars.push({
            key: "".concat(key, ".").concat(barData.indexValue),
            data: barData,
            x: x,
            y: y,
            width: barWidth,
            height: barHeight,
            color: getColor(barData)
          });
        }
      });
    });
  }
  return {
    xScale: xScale,
    yScale: yScale,
    bars: bars
  };
};
var generateGroupedBars = function generateGroupedBars(options) {
  return options.layout === 'vertical' ? generateVerticalGroupedBars(options) : generateHorizontalGroupedBars(options);
};

var getStackedScale = function getStackedScale(data, _minValue, _maxValue, range) {
  var allValues = flattenDepth(data, 2);
  var minValue = _minValue;
  if (minValue === 'auto') {
    minValue = min(allValues);
  }
  var maxValue = _maxValue;
  if (maxValue === 'auto') {
    maxValue = max(allValues);
  }
  return scaleLinear().rangeRound(range).domain([minValue, maxValue]);
};
var generateVerticalStackedBars = function generateVerticalStackedBars(_ref) {
  var data = _ref.data,
      getIndex = _ref.getIndex,
      keys = _ref.keys,
      minValue = _ref.minValue,
      maxValue = _ref.maxValue,
      reverse = _ref.reverse,
      width = _ref.width,
      height = _ref.height,
      getColor = _ref.getColor,
      _ref$padding = _ref.padding,
      padding = _ref$padding === void 0 ? 0 : _ref$padding,
      _ref$innerPadding = _ref.innerPadding,
      innerPadding = _ref$innerPadding === void 0 ? 0 : _ref$innerPadding;
  var stackedData = stack().keys(keys).offset(stackOffsetDiverging)(data);
  var xScale = getIndexedScale(data, getIndex, [0, width], padding);
  var yRange = reverse ? [0, height] : [height, 0];
  var yScale = getStackedScale(stackedData, minValue, maxValue, yRange);
  var bars = [];
  var barWidth = xScale.bandwidth();
  var getY = function getY(d) {
    return yScale(d[1]);
  };
  var getHeight = function getHeight(d, y) {
    return yScale(d[0]) - y;
  };
  if (reverse) {
    getY = function getY(d) {
      return yScale(d[0]);
    };
    getHeight = function getHeight(d, y) {
      return yScale(d[1]) - y;
    };
  }
  if (barWidth > 0) {
    stackedData.forEach(function (stackedDataItem) {
      xScale.domain().forEach(function (index, i) {
        var d = stackedDataItem[i];
        var x = xScale(getIndex(d.data));
        var y = getY(d);
        var barHeight = getHeight(d, y);
        if (innerPadding > 0) {
          y += innerPadding * 0.5;
          barHeight -= innerPadding;
        }
        if (barHeight > 0) {
          var barData = {
            id: stackedDataItem.key,
            value: d.data[stackedDataItem.key],
            index: i,
            indexValue: index,
            data: d.data
          };
          bars.push({
            key: "".concat(stackedDataItem.key, ".").concat(index),
            data: barData,
            x: x,
            y: y,
            width: barWidth,
            height: barHeight,
            color: getColor(barData)
          });
        }
      });
    });
  }
  return {
    xScale: xScale,
    yScale: yScale,
    bars: bars
  };
};
var generateHorizontalStackedBars = function generateHorizontalStackedBars(_ref2) {
  var data = _ref2.data,
      getIndex = _ref2.getIndex,
      keys = _ref2.keys,
      minValue = _ref2.minValue,
      maxValue = _ref2.maxValue,
      reverse = _ref2.reverse,
      width = _ref2.width,
      height = _ref2.height,
      getColor = _ref2.getColor,
      _ref2$padding = _ref2.padding,
      padding = _ref2$padding === void 0 ? 0 : _ref2$padding,
      _ref2$innerPadding = _ref2.innerPadding,
      innerPadding = _ref2$innerPadding === void 0 ? 0 : _ref2$innerPadding;
  var stackedData = stack().keys(keys).offset(stackOffsetDiverging)(data);
  var xRange = reverse ? [width, 0] : [0, width];
  var xScale = getStackedScale(stackedData, minValue, maxValue, xRange);
  var yScale = getIndexedScale(data, getIndex, [height, 0], padding);
  var bars = [];
  var barHeight = yScale.bandwidth();
  var getX = function getX(d) {
    return xScale(d[0]);
  };
  var getWidth = function getWidth(d, x) {
    return xScale(d[1]) - x;
  };
  if (reverse) {
    getX = function getX(d) {
      return xScale(d[1]);
    };
    getWidth = function getWidth(d, y) {
      return xScale(d[0]) - y;
    };
  }
  if (barHeight > 0) {
    stackedData.forEach(function (stackedDataItem) {
      yScale.domain().forEach(function (index, i) {
        var d = stackedDataItem[i];
        var y = yScale(getIndex(d.data));
        var barData = {
          id: stackedDataItem.key,
          value: d.data[stackedDataItem.key],
          index: i,
          indexValue: index,
          data: d.data
        };
        var x = getX(d);
        var barWidth = getWidth(d, x);
        if (innerPadding > 0) {
          x += innerPadding * 0.5;
          barWidth -= innerPadding;
        }
        if (barWidth > 0) {
          bars.push({
            key: "".concat(stackedDataItem.key, ".").concat(index),
            data: barData,
            x: x,
            y: y,
            width: barWidth,
            height: barHeight,
            color: getColor(barData)
          });
        }
      });
    });
  }
  return {
    xScale: xScale,
    yScale: yScale,
    bars: bars
  };
};
var generateStackedBars = function generateStackedBars(options) {
  return options.layout === 'vertical' ? generateVerticalStackedBars(options) : generateHorizontalStackedBars(options);
};

var getLegendDataForKeys = function getLegendDataForKeys(bars, layout, direction, groupMode, reverse) {
  var data = _uniqBy(bars.map(function (bar) {
    return {
      id: bar.data.id,
      label: bar.data.id,
      color: bar.color,
      fill: bar.data.fill
    };
  }), function (_ref) {
    var id = _ref.id;
    return id;
  });
  if (layout === 'vertical' && groupMode === 'stacked' && direction === 'column' && reverse !== true || layout === 'horizontal' && groupMode === 'stacked' && reverse === true) {
    data.reverse();
  }
  return data;
};
var getLegendDataForIndexes = function getLegendDataForIndexes(bars) {
  return _uniqBy(bars.map(function (bar) {
    return {
      id: bar.data.indexValue,
      label: bar.data.indexValue,
      color: bar.color,
      fill: bar.data.fill
    };
  }), function (_ref2) {
    var id = _ref2.id;
    return id;
  });
};
var getLegendData = function getLegendData(_ref3) {
  var from = _ref3.from,
      bars = _ref3.bars,
      layout = _ref3.layout,
      direction = _ref3.direction,
      groupMode = _ref3.groupMode,
      reverse = _ref3.reverse;
  if (from === 'indexes') {
    return getLegendDataForIndexes(bars);
  }
  return getLegendDataForKeys(bars, layout, direction, groupMode, reverse);
};

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var BarItem = function BarItem(_ref) {
  var data = _ref.data,
      x = _ref.x,
      y = _ref.y,
      width = _ref.width,
      height = _ref.height,
      borderRadius = _ref.borderRadius,
      color = _ref.color,
      borderWidth = _ref.borderWidth,
      borderColor = _ref.borderColor,
      label = _ref.label,
      shouldRenderLabel = _ref.shouldRenderLabel,
      labelColor = _ref.labelColor,
      showTooltip = _ref.showTooltip,
      hideTooltip = _ref.hideTooltip,
      onClick = _ref.onClick,
      onMouseEnter = _ref.onMouseEnter,
      onMouseLeave = _ref.onMouseLeave,
      tooltip = _ref.tooltip,
      theme = _ref.theme;
  var handleTooltip = function handleTooltip(e) {
    return showTooltip(tooltip, e);
  };
  var handleMouseEnter = function handleMouseEnter(e) {
    onMouseEnter(data, e);
    showTooltip(tooltip, e);
  };
  var handleMouseLeave = function handleMouseLeave(e) {
    onMouseLeave(data, e);
    hideTooltip(e);
  };
  return React.createElement("g", {
    transform: "translate(".concat(x, ", ").concat(y, ")")
  }, React.createElement("rect", {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    fill: data.fill ? data.fill : color,
    strokeWidth: borderWidth,
    stroke: borderColor,
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleTooltip,
    onMouseLeave: handleMouseLeave,
    onClick: onClick
  }), shouldRenderLabel && React.createElement("text", {
    x: width / 2,
    y: height / 2,
    textAnchor: "middle",
    dominantBaseline: "central",
    style: _objectSpread({}, theme.labels.text, {
      pointerEvents: 'none',
      fill: labelColor
    })
  }, label));
};
BarItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    indexValue: PropTypes.string.isRequired,
    fill: PropTypes.string
  }).isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  borderRadius: PropTypes.number.isRequired,
  borderWidth: PropTypes.number.isRequired,
  borderColor: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  shouldRenderLabel: PropTypes.bool.isRequired,
  labelColor: PropTypes.string.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  getTooltipLabel: PropTypes.func.isRequired,
  tooltipFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  tooltip: PropTypes.element.isRequired,
  theme: PropTypes.shape({
    tooltip: PropTypes.shape({}).isRequired,
    labels: PropTypes.shape({
      text: PropTypes.object.isRequired
    }).isRequired
  }).isRequired
};
var enhance = compose(withPropsOnChange(['data', 'color', 'onClick'], function (_ref2) {
  var data = _ref2.data,
      color = _ref2.color,
      _onClick = _ref2.onClick;
  return {
    onClick: function onClick(event) {
      return _onClick(_objectSpread({
        color: color
      }, data), event);
    }
  };
}), withPropsOnChange(['data', 'color', 'theme', 'tooltip', 'getTooltipLabel', 'tooltipFormat'], function (_ref3) {
  var data = _ref3.data,
      color = _ref3.color,
      theme = _ref3.theme,
      tooltip = _ref3.tooltip,
      getTooltipLabel = _ref3.getTooltipLabel,
      tooltipFormat = _ref3.tooltipFormat;
  return {
    tooltip: React.createElement(BasicTooltip, {
      id: getTooltipLabel(data),
      value: data.value,
      enableChip: true,
      color: color,
      theme: theme,
      format: tooltipFormat,
      renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _objectSpread({
        color: color,
        theme: theme
      }, data)) : null
    })
  };
}), pure);
var BarItem$1 = enhance(BarItem);

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$1(target, key, source[key]); }); } return target; }
function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var ArrowItem = function ArrowItem(_ref) {
  var data = _ref.data,
      x = _ref.x,
      width = _ref.width,
      borderRadius = _ref.borderRadius,
      color = _ref.color,
      label = _ref.label,
      shouldRenderLabel = _ref.shouldRenderLabel,
      labelColor = _ref.labelColor,
      showTooltip = _ref.showTooltip,
      hideTooltip = _ref.hideTooltip,
      onClick = _ref.onClick,
      onMouseEnter = _ref.onMouseEnter,
      onMouseLeave = _ref.onMouseLeave,
      tooltip = _ref.tooltip,
      theme = _ref.theme;
  var handleTooltip = function handleTooltip(e) {
    return showTooltip(tooltip, e);
  };
  var handleMouseEnter = function handleMouseEnter(e) {
    onMouseEnter(data, e);
    showTooltip(tooltip, e);
  };
  var handleMouseLeave = function handleMouseLeave(e) {
    onMouseLeave(data, e);
    hideTooltip(e);
  };
  var ya = 200;
  var arrowHeight = 30;
  var arrowOffset = 40;
  return React.createElement("g", {
    transform: "translate(".concat(x + arrowOffset, ", ").concat(ya, ")")
  }, React.createElement("rect", {
    width: width,
    height: arrowHeight,
    rx: borderRadius,
    ry: borderRadius,
    fill: "#555",
    stroke: "#555",
    strokeWidth: "5",
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleTooltip,
    onMouseLeave: handleMouseLeave,
    onClick: onClick
  }), React.createElement("polygon", {
    points: "0, ".concat(arrowHeight * -.4, " 0, ").concat(arrowHeight * 1.4, " ").concat(arrowHeight * .8, ", ").concat(arrowHeight * .5),
    transform: "translate(".concat(width, ")"),
    stroke: "#555",
    strokeWidth: "5",
    fill: "#555"
  }), React.createElement("rect", {
    width: width,
    height: arrowHeight,
    rx: borderRadius,
    ry: borderRadius,
    fill: color,
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleTooltip,
    onMouseLeave: handleMouseLeave,
    onClick: onClick
  }), React.createElement("polygon", {
    points: "0, ".concat(arrowHeight * -.4, " 0, ").concat(arrowHeight * 1.4, " ").concat(arrowHeight * .8, ", ").concat(arrowHeight * .5),
    transform: "translate(".concat(width, ")"),
    fill: color
  }), shouldRenderLabel && React.createElement("text", {
    x: arrowOffset,
    y: arrowHeight / 2,
    textAnchor: "middle",
    dominantBaseline: "central",
    style: _objectSpread$1({}, theme.labels.text, {
      pointerEvents: 'none',
      fill: labelColor
    })
  }, label));
};
ArrowItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    indexValue: PropTypes.string.isRequired,
    fill: PropTypes.string
  }).isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  borderRadius: PropTypes.number.isRequired,
  borderWidth: PropTypes.number.isRequired,
  label: PropTypes.node.isRequired,
  shouldRenderLabel: PropTypes.bool.isRequired,
  labelColor: PropTypes.string.isRequired,
  showTooltip: PropTypes.func.isRequired,
  hideTooltip: PropTypes.func.isRequired,
  getTooltipLabel: PropTypes.func.isRequired,
  tooltipFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  tooltip: PropTypes.element.isRequired,
  theme: PropTypes.shape({
    tooltip: PropTypes.shape({}).isRequired,
    labels: PropTypes.shape({
      text: PropTypes.object.isRequired
    }).isRequired
  }).isRequired
};
var enhance$1 = compose(withPropsOnChange(['data', 'color', 'onClick'], function (_ref2) {
  var data = _ref2.data,
      color = _ref2.color,
      _onClick = _ref2.onClick;
  return {
    onClick: function onClick(event) {
      return _onClick(_objectSpread$1({
        color: color
      }, data), event);
    }
  };
}), withPropsOnChange(['data', 'color', 'theme', 'tooltip', 'getTooltipLabel', 'tooltipFormat'], function (_ref3) {
  var data = _ref3.data,
      color = _ref3.color,
      theme = _ref3.theme,
      tooltip = _ref3.tooltip,
      getTooltipLabel = _ref3.getTooltipLabel,
      tooltipFormat = _ref3.tooltipFormat;
  return {
    tooltip: React.createElement(BasicTooltip, {
      id: getTooltipLabel(data),
      value: data.value,
      enableChip: true,
      color: color,
      theme: theme,
      format: tooltipFormat,
      renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _objectSpread$1({
        color: color,
        theme: theme
      }, data)) : null
    })
  };
}), pure);
var ArrowItem$1 = enhance$1(ArrowItem);

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } return target; }
function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var BarPropTypes = _objectSpread$2({
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  indexBy: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  getIndex: PropTypes.func.isRequired,
  keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  layers: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.oneOf(['grid', 'axes', 'bars', 'markers', 'legends', 'annotations', 'arrows']), PropTypes.func])).isRequired,
  groupMode: PropTypes.oneOf(['stacked', 'grouped']).isRequired,
  layout: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  reverse: PropTypes.bool.isRequired,
  minValue: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]).isRequired,
  maxValue: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]).isRequired,
  padding: PropTypes.number.isRequired,
  innerPadding: PropTypes.number.isRequired,
  axisTop: axisPropType,
  axisRight: axisPropType,
  axisBottom: axisPropType,
  axisLeft: axisPropType,
  enableGridX: PropTypes.bool.isRequired,
  enableGridY: PropTypes.bool.isRequired,
  gridXValues: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))]),
  gridYValues: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))]),
  barComponent: PropTypes.func.isRequired,
  arrowComponent: PropTypes.func.isRequired,
  enableLabel: PropTypes.bool.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  labelFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  getLabel: PropTypes.func.isRequired,
  labelSkipWidth: PropTypes.number.isRequired,
  labelSkipHeight: PropTypes.number.isRequired,
  labelTextColor: inheritedColorPropType.isRequired,
  getLabelTextColor: PropTypes.func.isRequired,
  labelLinkColor: inheritedColorPropType.isRequired,
  getLabelLinkColor: PropTypes.func.isRequired,
  colors: ordinalColorsPropType.isRequired,
  colorBy: colorPropertyAccessorPropType.isRequired,
  borderRadius: PropTypes.number.isRequired,
  getColor: PropTypes.func.isRequired
}, defsPropTypes, {
  borderWidth: PropTypes.number.isRequired,
  borderColor: inheritedColorPropType.isRequired,
  getBorderColor: PropTypes.func.isRequired,
  isInteractive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  tooltipLabel: PropTypes.func,
  getTooltipLabel: PropTypes.func.isRequired,
  tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  tooltip: PropTypes.func,
  legends: PropTypes.arrayOf(PropTypes.shape(_objectSpread$2({
    dataFrom: PropTypes.oneOf(['indexes', 'keys']).isRequired
  }, LegendPropShape))).isRequired,
  pixelRatio: PropTypes.number.isRequired
});
var BarDefaultProps = {
  indexBy: 'id',
  keys: ['value'],
  layers: ['grid', 'axes', 'bars', 'markers', 'legends', 'annotations', 'arrows'],
  groupMode: 'stacked',
  layout: 'vertical',
  reverse: false,
  minValue: 'auto',
  maxValue: 'auto',
  padding: 0.1,
  innerPadding: 0,
  axisBottom: {},
  axisLeft: {},
  enableGridX: false,
  enableGridY: true,
  barComponent: BarItem$1,
  arrowComponent: ArrowItem$1,
  enableLabel: true,
  label: 'value',
  labelSkipWidth: 0,
  labelSkipHeight: 0,
  labelLinkColor: 'theme',
  labelTextColor: 'theme',
  colors: {
    scheme: 'nivo'
  },
  colorBy: 'id',
  defs: [],
  fill: [],
  borderRadius: 0,
  borderWidth: 0,
  borderColor: {
    from: 'color'
  },
  isInteractive: true,
  onClick: noop,
  onMouseEnter: noop,
  onMouseLeave: noop,
  legends: [],
  annotations: [],
  pixelRatio: global.window && global.window.devicePixelRatio ? global.window.devicePixelRatio : 1
};

var enhance$2 = (function (Component) {
  return compose(defaultProps(BarDefaultProps), withTheme(), withDimensions(), withMotion(), withPropsOnChange(['colors', 'colorBy'], function (_ref) {
    var colors = _ref.colors,
        colorBy = _ref.colorBy;
    return {
      getColor: getOrdinalColorScale(colors, colorBy)
    };
  }), withPropsOnChange(['indexBy'], function (_ref2) {
    var indexBy = _ref2.indexBy;
    return {
      getIndex: getAccessorFor(indexBy)
    };
  }), withPropsOnChange(['labelTextColor', 'theme'], function (_ref3) {
    var labelTextColor = _ref3.labelTextColor,
        theme = _ref3.theme;
    return {
      getLabelTextColor: getInheritedColorGenerator(labelTextColor, theme)
    };
  }), withPropsOnChange(['labelLinkColor', 'theme'], function (_ref4) {
    var labelLinkColor = _ref4.labelLinkColor,
        theme = _ref4.theme;
    return {
      getLabelLinkColor: getInheritedColorGenerator(labelLinkColor, theme)
    };
  }), withPropsOnChange(['label', 'labelFormat'], function (_ref5) {
    var label = _ref5.label,
        labelFormat = _ref5.labelFormat;
    return {
      getLabel: getLabelGenerator(label, labelFormat)
    };
  }), withPropsOnChange(['borderColor', 'theme'], function (_ref6) {
    var borderColor = _ref6.borderColor,
        theme = _ref6.theme;
    return {
      getBorderColor: getInheritedColorGenerator(borderColor, theme)
    };
  }), withPropsOnChange(['tooltipLabel'], function (_ref7) {
    var tooltipLabel = _ref7.tooltipLabel;
    var getTooltipLabel = function getTooltipLabel(d) {
      return "".concat(d.id, " - ").concat(d.indexValue);
    };
    if (typeof tooltipLabel === 'function') {
      getTooltipLabel = tooltipLabel;
    }
    return {
      getTooltipLabel: getTooltipLabel
    };
  }), pure)(Component);
});

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var BarAnnotations = function BarAnnotations(_ref) {
  var bars = _ref.bars,
      annotations = _ref.annotations,
      animate = _ref.animate,
      motionStiffness = _ref.motionStiffness,
      motionDamping = _ref.motionDamping;
  var boundAnnotations = useAnnotations({
    items: bars,
    annotations: annotations,
    getPosition: function getPosition(bar) {
      return {
        x: bar.x + bar.width / 2,
        y: bar.y + bar.height / 2
      };
    },
    getDimensions: function getDimensions(bar, offset) {
      var width = bar.width + offset * 2;
      var height = bar.height + offset * 2;
      return {
        width: width,
        height: height,
        size: Math.max(width, height)
      };
    }
  });
  return boundAnnotations.map(function (annotation, i) {
    return React.createElement(Annotation, _extends({
      key: i
    }, annotation, {
      containerWidth: innerWidth,
      containerHeight: innerHeight,
      animate: animate,
      motionStiffness: motionStiffness,
      motionDamping: motionDamping
    }));
  });
};
BarAnnotations.propTypes = {};

function _extends$1() { _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$3(target, key, source[key]); }); } return target; }
function _defineProperty$3(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var barWillEnterHorizontal = function barWillEnterHorizontal(_ref) {
  var style = _ref.style;
  return {
    x: style.x.val,
    y: style.y.val,
    width: 0,
    height: style.height.val
  };
};
var barWillEnterVertical = function barWillEnterVertical(_ref2) {
  var style = _ref2.style;
  return {
    x: style.x.val,
    y: style.y.val + style.height.val,
    width: style.width.val,
    height: 0
  };
};
var barWillLeaveHorizontal = function barWillLeaveHorizontal(springConfig) {
  return function (_ref3) {
    var style = _ref3.style;
    return {
      x: style.x,
      y: style.y,
      width: spring(0, springConfig),
      height: style.height
    };
  };
};
var barWillLeaveVertical = function barWillLeaveVertical(springConfig) {
  return function (_ref4) {
    var style = _ref4.style;
    return {
      x: style.x,
      y: spring(style.y.val + style.height.val, springConfig),
      width: style.width,
      height: spring(0, springConfig)
    };
  };
};
var Bar = function Bar(props) {
  var data = props.data,
      getIndex = props.getIndex,
      keys = props.keys,
      groupMode = props.groupMode,
      layout = props.layout,
      reverse = props.reverse,
      minValue = props.minValue,
      maxValue = props.maxValue,
      margin = props.margin,
      width = props.width,
      height = props.height,
      outerWidth = props.outerWidth,
      outerHeight = props.outerHeight,
      padding = props.padding,
      innerPadding = props.innerPadding,
      valueBy = props.valueBy,
      axisTop = props.axisTop,
      axisRight = props.axisRight,
      axisBottom = props.axisBottom,
      axisLeft = props.axisLeft,
      enableGridX = props.enableGridX,
      enableGridY = props.enableGridY,
      gridXValues = props.gridXValues,
      gridYValues = props.gridYValues,
      layers = props.layers,
      barComponent = props.barComponent,
      arrowComponent = props.arrowComponent,
      enableLabel = props.enableLabel,
      getLabel = props.getLabel,
      labelSkipWidth = props.labelSkipWidth,
      labelSkipHeight = props.labelSkipHeight,
      getLabelTextColor = props.getLabelTextColor,
      markers = props.markers,
      theme = props.theme,
      getColor = props.getColor,
      defs = props.defs,
      fill = props.fill,
      borderRadius = props.borderRadius,
      borderWidth = props.borderWidth,
      getBorderColor = props.getBorderColor,
      annotations = props.annotations,
      isInteractive = props.isInteractive,
      getTooltipLabel = props.getTooltipLabel,
      tooltipFormat = props.tooltipFormat,
      tooltip = props.tooltip,
      onClick = props.onClick,
      onMouseEnter = props.onMouseEnter,
      onMouseLeave = props.onMouseLeave,
      legends = props.legends,
      arrowIndicators = props.arrowIndicators,
      animate = props.animate,
      motionStiffness = props.motionStiffness,
      motionDamping = props.motionDamping;
  var options = {
    layout: layout,
    reverse: reverse,
    data: data,
    getIndex: getIndex,
    keys: keys,
    minValue: minValue,
    maxValue: maxValue,
    width: width,
    height: height,
    getColor: getColor,
    padding: padding,
    innerPadding: innerPadding
  };
  var result = groupMode === 'grouped' ? generateGroupedBars(options) : generateStackedBars(options);
  var motionProps = {
    animate: animate,
    motionDamping: motionDamping,
    motionStiffness: motionStiffness
  };
  var springConfig = {
    damping: motionDamping,
    stiffness: motionStiffness
  };
  var willEnter = layout === 'vertical' ? barWillEnterVertical : barWillEnterHorizontal;
  var willLeave = layout === 'vertical' ? barWillLeaveVertical(springConfig) : barWillLeaveHorizontal(springConfig);
  var shouldRenderLabel = function shouldRenderLabel(_ref5) {
    var width = _ref5.width,
        height = _ref5.height;
    if (!enableLabel) return false;
    if (labelSkipWidth > 0 && width < labelSkipWidth) return false;
    if (labelSkipHeight > 0 && height < labelSkipHeight) return false;
    return true;
  };
  var boundDefs = bindDefs(defs, result.bars, fill, {
    dataKey: 'data',
    targetKey: 'data.fill'
  });
  return React.createElement(Container, {
    isInteractive: isInteractive,
    theme: theme,
    animate: animate,
    motionStiffness: motionStiffness,
    motionDamping: motionDamping
  }, function (_ref6) {
    var showTooltip = _ref6.showTooltip,
        hideTooltip = _ref6.hideTooltip;
    var commonProps = {
      borderRadius: borderRadius,
      borderWidth: borderWidth,
      enableLabel: enableLabel,
      labelSkipWidth: labelSkipWidth,
      labelSkipHeight: labelSkipHeight,
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
      onClick: onClick,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      theme: theme,
      getTooltipLabel: getTooltipLabel,
      tooltipFormat: tooltipFormat,
      tooltip: tooltip
    };
    var bars;
    if (animate === true) {
      bars = React.createElement(TransitionMotion, {
        key: "bars",
        willEnter: willEnter,
        willLeave: willLeave,
        styles: result.bars.map(function (bar) {
          return {
            key: bar.key,
            data: bar,
            style: {
              x: spring(bar.x, springConfig),
              y: spring(bar.y, springConfig),
              width: spring(bar.width, springConfig),
              height: spring(bar.height, springConfig)
            }
          };
        })
      }, function (interpolatedStyles) {
        return React.createElement("g", null, interpolatedStyles.map(function (_ref7) {
          var key = _ref7.key,
              style = _ref7.style,
              bar = _ref7.data;
          var baseProps = _objectSpread$3({}, bar, style);
          return React.createElement(barComponent, _objectSpread$3({
            key: key
          }, baseProps, commonProps, {
            shouldRenderLabel: shouldRenderLabel(baseProps),
            width: Math.max(style.width, 0),
            height: Math.max(style.height, 0),
            label: getLabel(bar.data),
            labelColor: getLabelTextColor(baseProps, theme),
            borderColor: getBorderColor(baseProps),
            theme: theme
          }));
        }));
      });
    } else {
      bars = result.bars.map(function (d) {
        return React.createElement(barComponent, _objectSpread$3({
          key: d.key
        }, d, commonProps, {
          label: getLabel(d.data),
          shouldRenderLabel: shouldRenderLabel(d),
          labelColor: getLabelTextColor(d, theme),
          borderColor: getBorderColor(d),
          theme: theme
        }));
      });
    }
    var arrows = result.bars.map(function (bar, index) {
      var next = result.bars[index + 1];
      if (!next) return null;
      var diff = bar.data[valueBy] - next.data[valueBy];
      var num = Math.round((diff / bar.data[valueBy] * -100).toFixed(2));
      var sign = num < 0 ? '' : '+';
      var label = "".concat(sign).concat(num, "%");
      return React.createElement(arrowComponent, _objectSpread$3({
        key: bar.key
      }, commonProps, bar, {
        labelColor: '#000',
        borderColor: getBorderColor(bar),
        shouldRenderLabel: true,
        color: '#fff',
        next: next,
        label: label
      }));
    });
    var layerById = {
      grid: React.createElement(Grid, {
        key: "grid",
        width: width,
        height: height,
        xScale: enableGridX ? result.xScale : null,
        yScale: enableGridY ? result.yScale : null,
        xValues: gridXValues,
        yValues: gridYValues
      }),
      axes: React.createElement(Axes, {
        key: "axes",
        xScale: result.xScale,
        yScale: result.yScale,
        width: width,
        height: height,
        top: axisTop,
        right: axisRight,
        bottom: axisBottom,
        left: axisLeft
      }),
      bars: bars,
      markers: React.createElement(CartesianMarkers, {
        key: "markers",
        markers: markers,
        width: width,
        height: height,
        xScale: result.xScale,
        yScale: result.yScale,
        theme: theme
      }),
      legends: legends.map(function (legend, i) {
        var legendData = getLegendData({
          from: legend.dataFrom,
          bars: result.bars,
          layout: layout,
          direction: legend.direction,
          groupMode: groupMode,
          reverse: reverse
        });
        if (legendData === undefined) return null;
        return React.createElement(BoxLegendSvg, _extends$1({
          key: i
        }, legend, {
          containerWidth: width,
          containerHeight: height,
          data: legendData,
          theme: theme
        }));
      }),
      annotations: React.createElement(BarAnnotations, _extends$1({
        key: "annotations",
        innerWidth: width,
        innerHeight: height,
        bars: result.bars,
        annotations: annotations
      }, motionProps))
    };
    if (arrowIndicators && keys.length === 1) {
      layerById.arrows = arrows;
    }
    return React.createElement(SvgWrapper, {
      width: outerWidth,
      height: outerHeight,
      margin: margin,
      defs: boundDefs,
      theme: theme
    }, layers.map(function (layer, i) {
      if (typeof layer === 'function') {
        return React.createElement(Fragment, {
          key: i
        }, layer(_objectSpread$3({}, props, result, {
          showTooltip: showTooltip,
          hideTooltip: hideTooltip
        })));
      }
      return layerById[layer];
    }));
  });
};
Bar.propTypes = BarPropTypes;
var Bar$1 = setDisplayName('Bar')(enhance$2(Bar));

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }
function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(Object(source)); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty$4(target, key, source[key]); }); } return target; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }
function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _defineProperty$4(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var findNodeUnderCursor = function findNodeUnderCursor(nodes, margin, x, y) {
  return nodes.find(function (node) {
    return isCursorInRect(node.x + margin.left, node.y + margin.top, node.width, node.height, x, y);
  });
};
var BarCanvas =
function (_Component) {
  _inherits(BarCanvas, _Component);
  function BarCanvas() {
    var _getPrototypeOf2;
    var _this;
    _classCallCheck(this, BarCanvas);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(BarCanvas)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _defineProperty$4(_assertThisInitialized(_this), "handleMouseHover", function (showTooltip, hideTooltip) {
      return function (event) {
        if (!_this.bars) return;
        var _this$props = _this.props,
            margin = _this$props.margin,
            theme = _this$props.theme,
            tooltip = _this$props.tooltip,
            getTooltipLabel = _this$props.getTooltipLabel,
            tooltipFormat = _this$props.tooltipFormat;
        var _getRelativeCursor = getRelativeCursor(_this.surface, event),
            _getRelativeCursor2 = _slicedToArray(_getRelativeCursor, 2),
            x = _getRelativeCursor2[0],
            y = _getRelativeCursor2[1];
        var bar = findNodeUnderCursor(_this.bars, margin, x, y);
        if (bar !== undefined) {
          showTooltip(React.createElement(BasicTooltip, {
            id: getTooltipLabel(bar.data),
            value: bar.data.value,
            enableChip: true,
            color: bar.color,
            theme: theme,
            format: tooltipFormat,
            renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _objectSpread$4({
              color: bar.color
            }, bar.data)) : null
          }), event);
        } else {
          hideTooltip();
        }
      };
    });
    _defineProperty$4(_assertThisInitialized(_this), "handleMouseLeave", function (hideTooltip) {
      return function () {
        hideTooltip();
      };
    });
    _defineProperty$4(_assertThisInitialized(_this), "handleClick", function (event) {
      if (!_this.bars) return;
      var _this$props2 = _this.props,
          margin = _this$props2.margin,
          onClick = _this$props2.onClick;
      var _getRelativeCursor3 = getRelativeCursor(_this.surface, event),
          _getRelativeCursor4 = _slicedToArray(_getRelativeCursor3, 2),
          x = _getRelativeCursor4[0],
          y = _getRelativeCursor4[1];
      var node = findNodeUnderCursor(_this.bars, margin, x, y);
      if (node !== undefined) onClick(node.data, event);
    });
    return _this;
  }
  _createClass(BarCanvas, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.ctx = this.surface.getContext('2d');
      this.draw(this.props);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(props) {
      if (this.props.outerWidth !== props.outerWidth || this.props.outerHeight !== props.outerHeight || this.props.isInteractive !== props.isInteractive || this.props.theme !== props.theme) {
        return true;
      } else {
        this.draw(props);
        return false;
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.ctx = this.surface.getContext('2d');
      this.draw(this.props);
    }
  }, {
    key: "draw",
    value: function draw(props) {
      var _this2 = this;
      var data = props.data,
          keys = props.keys,
          getIndex = props.getIndex,
          minValue = props.minValue,
          maxValue = props.maxValue,
          width = props.width,
          height = props.height,
          outerWidth = props.outerWidth,
          outerHeight = props.outerHeight,
          pixelRatio = props.pixelRatio,
          margin = props.margin,
          layout = props.layout,
          reverse = props.reverse,
          groupMode = props.groupMode,
          padding = props.padding,
          innerPadding = props.innerPadding,
          axisTop = props.axisTop,
          axisRight = props.axisRight,
          axisBottom = props.axisBottom,
          axisLeft = props.axisLeft,
          theme = props.theme,
          getColor = props.getColor,
          borderWidth = props.borderWidth,
          getBorderColor = props.getBorderColor,
          legends = props.legends,
          enableGridX = props.enableGridX,
          gridXValues = props.gridXValues,
          enableGridY = props.enableGridY,
          gridYValues = props.gridYValues;
      this.surface.width = outerWidth * pixelRatio;
      this.surface.height = outerHeight * pixelRatio;
      this.ctx.scale(pixelRatio, pixelRatio);
      var options = {
        layout: layout,
        reverse: reverse,
        data: data,
        getIndex: getIndex,
        keys: keys,
        minValue: minValue,
        maxValue: maxValue,
        width: width,
        height: height,
        getColor: getColor,
        padding: padding,
        innerPadding: innerPadding
      };
      var result = groupMode === 'grouped' ? generateGroupedBars(options) : generateStackedBars(options);
      this.bars = result.bars;
      this.ctx.fillStyle = theme.background;
      this.ctx.fillRect(0, 0, outerWidth, outerHeight);
      this.ctx.translate(margin.left, margin.top);
      if (theme.grid.line.strokeWidth > 0) {
        this.ctx.lineWidth = theme.grid.line.strokeWidth;
        this.ctx.strokeStyle = theme.grid.line.stroke;
        enableGridX && renderGridLinesToCanvas(this.ctx, {
          width: width,
          height: height,
          scale: result.xScale,
          axis: 'x',
          values: gridXValues
        });
        enableGridY && renderGridLinesToCanvas(this.ctx, {
          width: width,
          height: height,
          scale: result.yScale,
          axis: 'y',
          values: gridYValues
        });
      }
      this.ctx.strokeStyle = '#dddddd';
      var legendDataForKeys = _uniqBy(result.bars.map(function (bar) {
        return {
          id: bar.data.id,
          label: bar.data.id,
          color: bar.color,
          fill: bar.data.fill
        };
      }).reverse(), function (_ref) {
        var id = _ref.id;
        return id;
      });
      var legendDataForIndexes = _uniqBy(result.bars.map(function (bar) {
        return {
          id: bar.data.indexValue,
          label: bar.data.indexValue,
          color: bar.color,
          fill: bar.data.fill
        };
      }), function (_ref2) {
        var id = _ref2.id;
        return id;
      });
      legends.forEach(function (legend) {
        var legendData;
        if (legend.dataFrom === 'keys') {
          legendData = legendDataForKeys;
        } else if (legend.dataFrom === 'indexes') {
          legendData = legendDataForIndexes;
        }
        if (legendData === undefined) return null;
        renderLegendToCanvas(_this2.ctx, _objectSpread$4({}, legend, {
          data: legendData,
          containerWidth: width,
          containerHeight: height,
          itemTextColor: '#999',
          symbolSize: 16,
          theme: theme
        }));
      });
      renderAxesToCanvas(this.ctx, {
        xScale: result.xScale,
        yScale: result.yScale,
        width: width,
        height: height,
        top: axisTop,
        right: axisRight,
        bottom: axisBottom,
        left: axisLeft,
        theme: theme
      });
      result.bars.forEach(function (bar) {
        var x = bar.x,
            y = bar.y,
            color = bar.color,
            width = bar.width,
            height = bar.height;
        _this2.ctx.fillStyle = color;
        if (borderWidth > 0) {
          _this2.ctx.strokeStyle = getBorderColor(bar);
          _this2.ctx.lineWidth = borderWidth;
        }
        _this2.ctx.beginPath();
        _this2.ctx.rect(x, y, width, height);
        _this2.ctx.fill();
        if (borderWidth > 0) {
          _this2.ctx.stroke();
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;
      var _this$props3 = this.props,
          outerWidth = _this$props3.outerWidth,
          outerHeight = _this$props3.outerHeight,
          pixelRatio = _this$props3.pixelRatio,
          isInteractive = _this$props3.isInteractive,
          theme = _this$props3.theme;
      return React.createElement(Container, {
        isInteractive: isInteractive,
        theme: theme,
        animate: false
      }, function (_ref3) {
        var showTooltip = _ref3.showTooltip,
            hideTooltip = _ref3.hideTooltip;
        return React.createElement("canvas", {
          ref: function ref(surface) {
            _this3.surface = surface;
          },
          width: outerWidth * pixelRatio,
          height: outerHeight * pixelRatio,
          style: {
            width: outerWidth,
            height: outerHeight
          },
          onMouseEnter: _this3.handleMouseHover(showTooltip, hideTooltip),
          onMouseMove: _this3.handleMouseHover(showTooltip, hideTooltip),
          onMouseLeave: _this3.handleMouseLeave(hideTooltip),
          onClick: _this3.handleClick
        });
      });
    }
  }]);
  return BarCanvas;
}(Component);
BarCanvas.propTypes = BarPropTypes;
var BarCanvas$1 = setDisplayName('BarCanvas')(enhance$2(BarCanvas));

function _extends$2() { _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
var ResponsiveBar = function ResponsiveBar(props) {
  return React.createElement(ResponsiveWrapper, null, function (_ref) {
    var width = _ref.width,
        height = _ref.height;
    return React.createElement(Bar$1, _extends$2({
      width: width,
      height: height
    }, props));
  });
};

function _extends$3() { _extends$3 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }
var ResponsiveBarCanvas = function ResponsiveBarCanvas(props) {
  return React.createElement(ResponsiveWrapper, null, function (_ref) {
    var width = _ref.width,
        height = _ref.height;
    return React.createElement(BarCanvas$1, _extends$3({
      width: width,
      height: height
    }, props));
  });
};

export { Bar$1 as Bar, BarCanvas$1 as BarCanvas, BarDefaultProps, BarPropTypes, ResponsiveBar, ResponsiveBarCanvas };
