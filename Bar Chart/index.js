
const w = 900
const h = 500
const padding = 40
const svg = d3.select('#container')
              .append('svg')
              .attr('width', w)
              .attr('height', h)

const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
fetch(URL)
  .then(response => response.json())
  .then(jsonResponse => {
    const dataset = jsonResponse.data
    console.log(dataset)
    // Scales
    const xScale = d3.scaleTime()
                 .domain([d3.min(dataset, d => new Date(d[0])), d3.max(dataset, d => new Date(d[0]))]) 
                 .range([padding, w - padding]);
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(dataset, d => d[1])])
                     .range([h-padding, padding])
    // Axis
    const xAxis = d3.axisBottom(xScale)
                    .ticks(d3.timeYear.every(5))
    const yAxis = d3.axisLeft(yScale) // in scaleLinear ticks are automatic
    
    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', 'translate(0, ' + (h - padding) + ')')
       .call(xAxis)
    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + padding + ', 0)')
       .call(yAxis)

    // Bars
    const barPadding = 0
    const barWidth = (w - padding * 2 - (dataset.length - 1) * barPadding) / dataset.length

    svg.selectAll('rect')
       .data(dataset)
       .enter()
       .append('rect')
       .attr('height', (d) => h - yScale(d[1]) - padding)
       .attr('width', barWidth)
       .attr('x', (d) => xScale(new Date(d[0])))
       .attr('y', (d) => yScale(d[1]))
       .attr('class', 'bar')
       .attr('data-date', (d) => d[0])
       .attr('data-gdp', (d) => d[1])
       .attr('fill', 'rgb(51, 173, 255)')
       .on('mouseover', handleMouseIn)
       .on('mouseout', handleMouseOut)
  })

  // Función para obtener el trimestre
  function getQuarter(date) {
    const month = date.getMonth()
    return Math.floor(month / 3) + 1
  }

  // Función para manejar el mouse sobre las barras
  function handleMouseIn(event, d) {
    // Formatear fecha
    const date = new Date(d[0])
    const year = date.getFullYear()
    const quarter = getQuarter(date)
    const formattedDate = `${year} Q${quarter}`

    const tooltip = d3.select('#tooltip')
    tooltip.transition()
          .duration(200)
          .style('opacity', 0.9)
    tooltip.html(`${formattedDate}<br>$${d[1]} Billion`)
          .attr('data-date', d[0]) 
          .style('left', (event.pageX + 5) + 'px') 
          .style('top', (event.pageY - 28) + 'px')
  }

  // Función para manejar el mouse al salir de las barras
  function handleMouseOut() {
    d3.select('#tooltip').transition()
          .duration(500)
          .style('opacity', 0)
  }
  