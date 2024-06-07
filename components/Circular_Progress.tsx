interface Props {
    strokeWidth?: number
    sqSize?: number
    percentage: number
    description: string
}

const CircularProgressBar = (props: Props) => {
    const { strokeWidth = 8, sqSize = 160, percentage, description } = props
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const CircumfrenceOfTheCircle = radius * Math.PI * 2;
    const progressOffset = CircumfrenceOfTheCircle - (CircumfrenceOfTheCircle * (percentage || 0)) / 100;

    return (
        <svg width={sqSize} height={sqSize} viewBox={viewBox}>
            <circle
                className="fill-none stroke-gray-200"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
            />
            <circle
                className="fill-none stroke-violet-600 transition-all ease-in delay-200"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeLinecap="round"
                strokeWidth={`${strokeWidth}px`}
                transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                style={{
                    strokeDasharray: CircumfrenceOfTheCircle,
                    strokeDashoffset: progressOffset,
                }}
            />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="#000"
                fontSize="1.2em">
                {percentage}%
                <tspan x="50%" dy="1.2em" fontSize="0.8em" fill="#333">{description}</tspan>
            </text>
        </svg>
    )
}

export default CircularProgressBar