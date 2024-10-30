const w = 1000;
const h = 600;
const padding = 40;
const circleRadius = 7;
const transitionDuration = 100;
const legendX = 900;

const svg = d3.select('#container')
              .append('svg')
              .attr('width', w)
              .attr('height', h);

const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

async function fetchData() {
  const response = await fetch(URL);
  const dataset = await response.json();
  
  // Scales
  const xScale = d3.scaleLinear()
                   .domain([d3.min(dataset, d => d.Year) - 1, d3.max(dataset, d => d.Year) + 1])
                   .range([padding, w - padding]);

  const yScale = d3.scaleTime()
                   .domain([
                     d3.max(dataset, d => dateFromSeconds(d.Seconds)),
                     d3.min(dataset, d => dateFromSeconds(d.Seconds))
                   ])
                   .range([h - padding, padding]);

  // Design
  createAxis(svg, xScale, yScale);
  createTitle(svg);
  createLegend(svg);

  // Dots
  svg.selectAll('circle')
     .data(dataset)
     .enter()
     .append('circle')
     .attr('cx', d => xScale(d.Year))
     .attr('cy', d => yScale(dateFromSeconds(d.Seconds)))
     .attr('r', circleRadius)
     .attr('class', d => d.Doping ? 'dot doping' : 'dot no-doping')
     .attr('data-xvalue', d => d.Year)
     .attr('data-yvalue', d => dateFromSeconds(d.Seconds))
     .on('mouseover', handleMouseIn)
     .on('mouseout', handleMouseOut);
}

fetchData();

// Función para manejar el mouse sobre los puntos
function handleMouseIn(event, d) {
  const doping = d.Doping ? `<br><br>${d.Doping}` : "";
  const data = `${d.Name}: ${d.Nationality}<br>Year: ${d.Year}, Time: ${d.Time}${doping}`;
  
  const tooltip = d3.select('#tooltip')
  tooltip.style('display', 'block')
         .html(data)
         .attr('data-year', d.Year)
         .style('left', (event.pageX + 5) + 'px')
         .style('top', (event.pageY - 28) + 'px')
         .transition()
         .duration(transitionDuration)
         .style('opacity', 0.9);
}

function handleMouseOut() {
  d3.select('#tooltip')
    .transition()
    .duration(transitionDuration)
    .style('opacity', 0)
    .on('end', () => d3.select('#tooltip').style('display', 'none'));
}

function dateFromSeconds(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return new Date(1970, 0, 1, 0, min, sec);
}

function createAxis(svg, xScale, yScale) {
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale)
                  .ticks(d3.timeSecond.every(15))
                  .tickFormat(d3.timeFormat('%M:%S'));

  svg.append('g')
     .attr('id', 'x-axis')
     .attr('transform', `translate(0, ${h - padding})`)
     .call(xAxis);

  svg.append('g')
     .attr('id', 'y-axis')
     .attr('transform', `translate(${padding}, 0)`)
     .call(yAxis);

  svg.append('text')
     .attr('class', 'axis-label')
     .attr('transform', 'rotate(-90)')
     .attr('x', -h / 2 + (padding * 3))
     .attr('y', -padding / 2)
     .attr('text-anchor', 'middle')
     .text('Time in minutes');
}

function createLegend(svg) {
  const legendData = [
    { class: 'doping', text: 'Riders with doping allegations' },
    { class: 'no-doping', text: 'No doping allegations' }
  ];

  const legend = svg.append('g')
                    .attr('id', 'legend')
                    .selectAll('.legend-label')
                    .data(legendData)
                    .enter()
                    .append('g')
                    .attr('class', 'legend-label')
                    .attr('transform', (d, i) => `translate(0, ${250 + i * (18 + 10)})`);

  legend.append('rect')
        .attr('x', legendX)
        .attr('width', 18)
        .attr('height', 18)
        .attr('class', d => d.class);

  legend.append('text')
        .attr('x', legendX - 6)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(d => d.text);
}

function createTitle(svg) {
  svg.append('text')
     .attr('class', 'chart-title')
     .attr('x', w / 2)
     .attr('y', padding / 2)
     .attr('text-anchor', 'middle')
     .text("35 Fastest times up Alpe d'Huez");
}
