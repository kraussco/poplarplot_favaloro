import React, { useState, useRef, useEffect } from 'react';
import { Slider, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import * as d3 from 'd3';

// Constants that will be calculated dynamically
let WIDTH = 700;
let HEIGHT = 600;
let R_INNER = 180;
let R_OUTER = 220;
let CX = WIDTH / 2;
let CY = HEIGHT / 2;
const N_ANGULAR = 400; // Smoothness of the ring

// Constants for plot
let PLOT_SIZE = 140; // Size of the plot area
const PLOT_X_RANGE = 3; // x range from 0 to 3 (matching slider range)
const PLOT_Y_RANGE = 4; // y range for the kernel ratio
const PLOT_POINTS = 200; // Number of points to plot

// Colorbar constants
let COLORBAR_WIDTH = 30;
let COLORBAR_HEIGHT = 300;
let COLORBAR_X = WIDTH - 80;
let COLORBAR_Y = 120;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Update dimensions based on screen size
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const scale = isMobile ? 0.8 : isTablet ? 0.9 : 1;
      
      WIDTH = Math.min(containerWidth * scale, 700);
      HEIGHT = WIDTH * 0.85;
      R_INNER = WIDTH * 0.26;
      R_OUTER = WIDTH * 0.31;
      CX = WIDTH / 2;
      CY = HEIGHT / 2;
      PLOT_SIZE = WIDTH * 0.2;
      
      // Update colorbar dimensions
      COLORBAR_WIDTH = WIDTH * 0.04;
      COLORBAR_HEIGHT = HEIGHT * 0.5;
      COLORBAR_X = WIDTH - (WIDTH * 0.12);
      COLORBAR_Y = HEIGHT * 0.2;
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set SVG dimensions
    svg.attr('width', WIDTH)
       .attr('height', HEIGHT);

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

    // Create plot group
    const plotGroup = g.append('g')
      .attr('transform', `translate(${-PLOT_SIZE/2}, ${-PLOT_SIZE/2})`);

    // Create scales for the plot
    const xScale = d3.scaleLinear()
      .domain([0, PLOT_X_RANGE])
      .range([0, PLOT_SIZE]);
    
    const yScale = d3.scaleLinear()
      .domain([0, PLOT_Y_RANGE])
      .range([PLOT_SIZE, 0]);

    // Draw grid lines
    const xGrid = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(-PLOT_SIZE)
      .tickFormat(() => '');
    
    const yGrid = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(-PLOT_SIZE)
      .tickFormat(() => '');

    plotGroup.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0,${PLOT_SIZE})`)
      .call(xGrid)
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 0.7);

    plotGroup.append('g')
      .attr('class', 'y-grid')
      .call(yGrid)
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 0.7);

    // Draw axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));
    
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    plotGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${PLOT_SIZE})`)
      .call(xAxis)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', '10px');

    // Add x-axis label
    plotGroup.append('text')
      .attr('x', PLOT_SIZE/2)
      .attr('y', PLOT_SIZE + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '14px')
      .text('ξ');

    plotGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .selectAll('text')
      .attr('fill', 'white')
      .style('font-size', '10px');

   

    // Add glow effect definition
    const defs = svg.append('defs');
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Draw quadratic curve
    const curvePath = d3.path();
    for (let i = 0; i <= PLOT_POINTS; i++) {
      const t = i / PLOT_POINTS;
      const x = t * PLOT_X_RANGE;
      // Calculate kernel_h and kernel_v
      const kernel_h = (x * x - 2 * x + 1) / (x * x - x + 1);
      const kernel_v = 1 / (x * x - x + 1);
      const y = kernel_h / kernel_v; // This simplifies to (x^2 - 2x + 1)
      if (i === 0) {
        curvePath.moveTo(xScale(x), yScale(y));
      } else {
        curvePath.lineTo(xScale(x), yScale(y));
      }
    }
    plotGroup.append('path')
      .attr('d', curvePath.toString())
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Add glowing marker
    const markerX = xScale(xi);
    const kernel_h = (xi * xi - 2 * xi + 1) / (xi * xi - xi + 1);
    const kernel_v = 1 / (xi * xi - xi + 1);
    const markerY = yScale(kernel_h / kernel_v);
    const currentY = kernel_h / kernel_v;

    // Add marker group
    const markerGroup = plotGroup.append('g')
      .attr('transform', `translate(${markerX}, ${markerY})`);

    // Add the glowing circle
    markerGroup.append('circle')
      .attr('r', 5)
      .attr('fill', 'white')
      .attr('filter', 'url(#glow)');

    // Add the annotation with background
    const annotation = markerGroup.append('g')
      .attr('transform', 'translate(15, -15)');

    // Add background rectangle
    annotation.append('rect')
      .attr('x', -5)
      .attr('y', -20)
      .attr('width', 60)
      .attr('height', 25)
      .attr('rx', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.7)')
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    // Add the text
    annotation.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'white')
      .style('font-size', '14px')
      .style('font-family', 'monospace')
      .text(currentY.toFixed(3));

    // Draw colorbar
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
      .style('font-size', `${Math.max(10, WIDTH * 0.015)}px`);
  }, [xi, isMobile, isTablet]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setXi(newValue as number);
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        maxWidth: '100%', 
        margin: '0 auto', 
        padding: { xs: 1, sm: 2, md: 3 },
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
          marginBottom: { xs: 2, sm: 3 },
          textAlign: 'center',
          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }
        }}
      >
        Annulus Color Mapping: <InlineMath math={'r = \\frac{(1 + (\\xi - 2)\\cos^2\\phi)^2}{\\xi^2 - \\xi + 1}'} />
      </Typography>
      <Box sx={{ width: '100%', mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <Typography 
          gutterBottom 
          sx={{ 
            color: 'var(--text-secondary)',
            marginBottom: { xs: 1, sm: 2 },
            textAlign: 'center',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
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
        <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto' }} />
      </Box>
    </Box>
  );
};

export default AnnulusPlot; 