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
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: 800, 
        margin: '0 auto', 
        padding: 3,
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          color: 'var(--text-primary)',
          fontWeight: 500,
          marginBottom: 3,
          textAlign: 'center'
        }}
      >
        Polar Plot: r = (1 + (ξ - 2)cos²(φ))²/(ξ² - ξ + 1)
      </Typography>
      <Box sx={{ width: '100%', mb: 4, px: 2 }}>
        <Typography 
          gutterBottom 
          sx={{ 
            color: 'var(--text-secondary)',
            marginBottom: 2,
            textAlign: 'center'
          }}
        >
          Parameter ξ: {xi.toFixed(2)}
        </Typography>
        <Slider
          value={xi}
          onChange={handleSliderChange}
          min={0}
          max={3}
          step={0.01}
          valueLabelDisplay="auto"
          sx={{
            color: 'var(--accent)',
            '& .MuiSlider-thumb': {
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(136, 132, 216, 0.16)'
              }
            }
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 'auto']} 
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <Radar
            name="Parametric Plot"
            dataKey="radius"
            stroke="var(--accent)"
            fill="none"
            strokeWidth={2}
          />
        </RadarChart>
      </Box>
    </Box>
  );
};

export default PolarPlot; 