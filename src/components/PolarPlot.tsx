import React, { useState, useMemo } from 'react';
import { PolarAngleAxis, PolarRadiusAxis, RadarChart, Radar } from 'recharts';
import { Slider, Box, Typography } from '@mui/material';

interface Point {
  angle: number;
  radius: number;
}

const PolarPlot: React.FC = () => {
  const [xi, setXi] = useState<number>(2);

  const data = useMemo(() => {
    const points: Point[] = [];
    // Generate points for the function (1 + (xi - 2)*cos(phi)^2)^2/(xi^2 - xi + 1)
    // Using radians from 0 to 2π with higher resolution
    for (let phi = 0; phi <= 2 * Math.PI; phi += 0.01) {
      const cosPhiSquared = Math.pow(Math.cos(phi - Math.PI / 2), 2);
      const numerator = Math.pow(1 + (xi - 2) * cosPhiSquared, 2);
      const denominator = Math.pow(xi, 2) - xi + 1;
      const radius = numerator / denominator;
      
      points.push({
        angle: phi,
        radius: radius,
      });
    }
    return points;
  }, [xi]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setXi(newValue as number);
  };

  // Custom tick formatter to show radians
  const formatAngleTick = (value: number) => {
    if (value === 0) return '0';
    if (value === Math.PI / 2) return 'π/2';
    if (value === Math.PI) return 'π';
    if (value === 3 * Math.PI / 2) return '3π/2';
    if (value === 2 * Math.PI) return '2π';
    return '';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Polar Plot: r = (1 + (ξ - 2)cos²(φ))²/(ξ² - ξ + 1)
      </Typography>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography gutterBottom>
          Parameter ξ: {xi.toFixed(2)}
        </Typography>
        <Slider
          value={xi}
          onChange={handleSliderChange}
          min={0}
          max={3}
          step={0.01}
          valueLabelDisplay="auto"
        />
      </Box>
      <RadarChart
        width={600}
        height={600}
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis 
          dataKey="angle" 
          tickFormatter={formatAngleTick}
          tickCount={5}
        />
        <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
        <Radar
          name="Parametric Plot"
          dataKey="radius"
          stroke="#8884d8"
          fill="none"
          strokeWidth={2}
        />
      </RadarChart>
    </Box>
  );
};

export default PolarPlot; 