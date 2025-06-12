import React, { useState, useRef, useEffect } from 'react';
import { Slider, Box, Typography } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import * as d3 from 'd3';

const WIDTH = 700;
const HEIGHT = 600;
const R_INNER = 180;
const R_OUTER = 220;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const N_ANGULAR = 400; // Smoothness of the ring

const COLORBAR_WIDTH = 30;
const COLORBAR_HEIGHT = 300;
const COLORBAR_X = WIDTH - 80;
const COLORBAR_Y = 120;

const plasma = d3.interpolatePlasma;

const calculateValue = (xi: number, theta: number) => {
  const cosPhiSquared = Math.pow(Math.cos(theta - Math.PI / 2), 2);
  const numerator = Math.pow(1 + (xi - 2) * cosPhiSquared, 2);
  const denominator = Math.pow(xi, 2) - xi + 1;
  return numerator / denominator;
};

const AnnulusPlot: React.FC = () => {
  const [xi, setXi] = useState<number>(0.3);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Compute all values for this xi
    const values: number[] = [];
    for (let i = 0; i < N_ANGULAR; ++i) {
      const theta = (i / N_ANGULAR) * 2 * Math.PI;
      values.push(calculateValue(xi, theta));
    }
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Draw annulus segments
    const g = svg.append('g').attr('transform', `translate(${CX},${CY})`);
    for (let i = 0; i < N_ANGULAR; ++i) {
      const theta0 = (i / N_ANGULAR) * 2 * Math.PI;
      const theta1 = ((i + 1) / N_ANGULAR) * 2 * Math.PI;
      const value = calculateValue(xi, theta0);
      const t = (value - minValue) / (maxValue - minValue || 1); // avoid div by zero
      const color = plasma(Math.max(0, Math.min(1, t)));
      const path = d3.path();
      path.arc(0, 0, R_OUTER, theta0, theta1);
      path.arc(0, 0, R_INNER, theta1, theta0, true);
      path.closePath();
      g.append('path')
        .attr('d', path.toString())
        .attr('fill', color)
        .attr('stroke', 'none');
    }
    // Draw inner and outer circles (white border)
    g.append('circle')
      .attr('r', R_INNER)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
    g.append('circle')
      .attr('r', R_OUTER)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Draw colorbar
    const defs = svg.append('defs');
    const gradientId = 'colorbar-gradient';
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '0%').attr('y2', '0%');
    for (let i = 0; i <= 100; ++i) {
      const t = i / 100;
      gradient.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', plasma(t));
    }
    svg.append('rect')
      .attr('x', COLORBAR_X)
      .attr('y', COLORBAR_Y)
      .attr('width', COLORBAR_WIDTH)
      .attr('height', COLORBAR_HEIGHT)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
    // Colorbar axis
    const scale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([COLORBAR_Y + COLORBAR_HEIGHT, COLORBAR_Y]);
    const axis = d3.axisRight(scale)
      .ticks(5)
      .tickFormat(d3.format(".2f"));
    svg.append('g')
      .attr('transform', `translate(${COLORBAR_X + COLORBAR_WIDTH},0)`)
      .call(axis)
      .selectAll('text')
      .style('fill', 'var(--text-primary)')
      .style('font-size', '16px');
  }, [xi]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setXi(newValue as number);
  };

  return (
    <Box 
      sx={{ 
        width: WIDTH, 
        maxWidth: WIDTH, 
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
        Annulus Color Mapping: <InlineMath math={'r = \\frac{(1 + (\\xi - 2)\\cos^2\\phi)^2}{\\xi^2 - \\xi + 1}'} />
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
          Parameter <InlineMath math={'\\xi'} />: {xi.toFixed(2)}
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
        <svg ref={svgRef} width={WIDTH} height={HEIGHT} />
      </Box>
    </Box>
  );
};

export default AnnulusPlot; 