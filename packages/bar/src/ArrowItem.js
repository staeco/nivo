/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React from 'react'
import PropTypes from 'prop-types'
import compose from 'recompose/compose'
import withPropsOnChange from 'recompose/withPropsOnChange'
import pure from 'recompose/pure'
import { BasicTooltip } from '@nivo/tooltip'

const ArrowItem = ({
    x,
    width,
    height,
    borderRadius,
    color,

    label,
    shouldRenderLabel,

    onClick,

    theme,
}) => {
    const ya = height * .75 // y < 40 ? 0 : y - 20
    const xa = 35
    const arrowHeight = 20
    const arrowOffset = width / 2
    return (
        <g transform={`translate(${x+arrowOffset}, ${ya})`}>
            {/* "shadow" arrow */}
            <rect
                width={xa}
                height={arrowHeight}
                rx={borderRadius}
                ry={borderRadius}
                fill="#555"
                stroke="#555" strokeWidth="2"
                onClick={onClick}
            />
            <polygon
                points={`0, ${arrowHeight * - .4} 0, ${arrowHeight * 1.4} ${arrowHeight * .8}, ${arrowHeight * .5}`}
                transform={`translate(${xa})`}
                stroke="#555" strokeWidth="2"
                fill="#555" />
            <rect
                width={xa+1}
                height={arrowHeight}
                rx={borderRadius}
                ry={borderRadius}
                fill={color}
                onClick={onClick}
            />
            <polygon
                points={`0, ${arrowHeight * - .4} 0, ${arrowHeight * 1.4} ${arrowHeight * .8}, ${arrowHeight * .5}`}
                transform={`translate(${xa})`}
                fill={color} />
            {shouldRenderLabel && (
                <text
                    x={xa / 1.4}
                    y={arrowHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                        ...theme.labels.text,
                        pointerEvents: 'none',
                        fill: '#000',
                    }}
                >
                    {label}
                </text>
            )}
        </g>
    )
}

ArrowItem.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        indexValue: PropTypes.string.isRequired,
        fill: PropTypes.string,
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
            text: PropTypes.object.isRequired,
        }).isRequired,
    }).isRequired,
}

const enhance = compose(
    withPropsOnChange(['data', 'color', 'onClick'], ({ data, color, onClick }) => ({
        onClick: event => onClick({ color, ...data }, event),
    })),
    withPropsOnChange(
        ['data', 'color', 'theme', 'tooltip', 'getTooltipLabel', 'tooltipFormat'],
        ({ data, color, theme, tooltip, getTooltipLabel, tooltipFormat }) => ({
            tooltip: (
                <BasicTooltip
                    id={getTooltipLabel(data)}
                    value={data.value}
                    enableChip={true}
                    color={color}
                    theme={theme}
                    format={tooltipFormat}
                    renderContent={
                        typeof tooltip === 'function'
                            ? tooltip.bind(null, { color, theme, ...data })
                            : null
                    }
                />
            ),
        })
    ),
    pure
)

export default enhance(ArrowItem)
