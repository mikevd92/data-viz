import {useEffect, useRef, useState} from "react";
import * as d3 from 'd3';
import {legendColor} from 'd3-svg-legend'
import {Col, DropdownButton, Row, Dropdown} from "react-bootstrap";
import data from "bootstrap/js/src/dom/data";

export function Usa(props) {
    const ref = useRef()
    const svg = useRef()
    const presentSvg = useRef();
    const [csvData, setcsvData] = useState([]);
    const [jsonData, setJsonData] = useState([]);
    const [category, setCategory] = useState("");
    const [oldData, setOldData] = useState();
    const [oldState, setOldState] = useState("");
    let prevFill = ""
    let prevState = oldState;
    const renderSvg = () => {
        const presentD3Svg = d3.select(presentSvg.current)
        presentD3Svg.selectAll("#state").remove()
        presentD3Svg.select("#current").remove()
        if (jsonData.length !== 0) {
            const values = csvData.map(item => item[category]);
            const min=Math.min(...values)
            const max=Math.max(...values)
            const color = d3.scaleLinear().domain([min,max]).range(["#ffcccc", "red"])
            const handleClick = (event, data) => {
                const {height, width} = svg.current.getBBox();
                const projectionPres = d3.geoAlbersUsa().scale(900).fitSize([width,height],data)
                const geoGeneratorPres = d3.geoPath().projection(projectionPres)
                if(oldData!==undefined) {
                    const oldState = oldData.properties.NAME;
                    const oldStateObj = csvData.find(elem => elem.State === oldState)
                    const oldCategoryValue = parseFloat(oldStateObj[category]);
                    d3.select("#state-" + oldData.properties.GEO_ID).style("fill", color(oldCategoryValue));
                }
                const state = data.properties.NAME;
                const stateObj = csvData.find(elem => elem.State === state)
                const categoryValue = parseFloat(stateObj[category]);
                d3.select("#state-" + prevState).style("fill", prevFill)
                d3.select("#state-" + data.properties.GEO_ID).style('fill', '#72bcd4')
                presentD3Svg.select("#current").remove()
                presentD3Svg.selectAll("#state").remove()
                const presentG = presentD3Svg.append("g").attr("id","current").attr("class","map")
                presentG.append("path").attr("d",geoGeneratorPres(data)).style('fill', '#72bcd4');
                presentG.append("svg:text")
                    .text(data.properties.NAME)
                    .attr("x", width/2)
                    .attr("y", height/2)
                    .attr("text-anchor", "middle")
                    .attr('font-size', '18pt');
                presentG.append("svg:text")
                    .text(`${category} : ${categoryValue}`)
                    .attr("x", width/2)
                    .attr("y", height/2+30)
                    .attr("text-anchor", "middle")
                    .attr('font-size', '18pt');
                prevFill=d3.select('#state-' + data.properties.GEO_ID).attr("fill")
                prevState=data.properties.GEO_ID
                setOldData(data)
                setOldState(prevState)
                return d3.select('#state-' + data.properties.GEO_ID).style('fill', '#72bcd4')
            }
            let projection = d3.geoAlbersUsa().scale(900).translate([400, 210]);
            let geoGenerator = d3.geoPath()
                .projection(projection);
            const d3Svg = d3.select(svg.current)
            let legendG = d3Svg.select("#legend");
            legendG.remove()
            const g = d3.select(ref.current)
            let paths = g.selectAll('path')
            paths.remove();
            let texts = g.selectAll("text")
            texts.remove();
            const legend = legendColor().title(category).orient('horizontal').shapePadding(50).scale(color)
            legendG = d3Svg.append("g").attr("id", "legend")
            legendG.attr("transform", "translate(200,440)")
                .call(legend)
            paths = g.selectAll('path')
            paths
                .data(jsonData.features)
                .join('path')
                .attr('d', geoGenerator)
                .attr('fill', (data) => {
                    const state = data.properties.NAME;
                    const stateObj = csvData.find(elem => elem.State === state)
                    if (stateObj !== undefined) {
                        const categoryValue = parseFloat(stateObj[category]);
                        return color(categoryValue);
                    } else {
                        return color(0);
                    }
                })
                .attr('id', (data) => {
                    return 'state-' + data.properties.GEO_ID
                }).on('click', handleClick)
                .on('mouseover',(event,data)=>{
                    d3Svg.style("cursor","pointer")
                    d3.select('#state-' + data.properties.GEO_ID).style('fill', '#d0c172')
                })
                .on('mouseout',(event,data)=>{
                    const state = data.properties.NAME;
                    const stateObj = csvData.find(elem => elem.State === state)
                    const categoryValue = parseFloat(stateObj[category]);
                    if(prevState === '' || prevState !== data.properties.GEO_ID) {
                        d3.select('#state-' + data.properties.GEO_ID).style('fill', color(categoryValue))
                    }else if(prevState === data.properties.GEO_ID){
                        d3.select('#state-' + data.properties.GEO_ID).style('fill', '#72bcd4')
                    }
                    d3Svg.style("cursor","pointer")
                })
            texts = g.selectAll('texts')
            texts.data(jsonData.features)
                .enter()
                .filter(data => {
                    return data.properties.GEO_ID !== '0400000US72'
                })
                .append("svg:text")
                .text(data => data.properties.ID)
                .attr("x", data => geoGenerator.centroid(data)[0])
                .attr("y", data => geoGenerator.centroid(data)[1])
                .attr("text-anchor", "middle")
                .attr('font-size', '6pt')
                .on('click', handleClick)
            if(oldData !== undefined) {
                const state = oldData.properties.NAME;
                const stateObj = csvData.find(elem => elem.State === state)
                const categoryValue = parseFloat(stateObj[category]);
                const {height, width} = svg.current.getBBox();
                const projectionPres = d3.geoAlbersUsa().scale(900).fitSize([width, height], oldData)
                const geoGeneratorPres = d3.geoPath().projection(projectionPres)
                const presentG = presentD3Svg.append("g").attr("id", "current").attr("class", "map")
                presentG.append("path").attr("d", geoGeneratorPres(oldData)).style('fill', '#72bcd4');
                d3.select('#state-' + oldData.properties.GEO_ID).style('fill', '#72bcd4')
                presentG.append("svg:text")
                    .text(oldData.properties.NAME)
                    .attr("x", width/2)
                    .attr("y", height/2)
                    .attr("text-anchor", "middle")
                    .attr('font-size', '18pt');
                presentG.append("svg:text")
                    .text(`${category} : ${categoryValue}`)
                    .attr("x", width/2)
                    .attr("y", height/2+30)
                    .attr("text-anchor", "middle")
                    .attr('font-size', '18pt');

            }
        }
        if (!!svg.current) {
            const {height, width} = svg.current.getBBox();
            svg.current.setAttribute("viewBox", `0 0 ${(width + 50)} ${height + 30}`)
        }
        if (!!presentSvg.current) {
            const {height, width} = svg.current.getBBox();
            presentSvg.current.setAttribute("viewBox", `0 0 ${(width + 50)} ${height + 30}`)
            const presentD3Svg = d3.select(presentSvg.current)
            if(oldData===undefined) {
                presentD3Svg.insert("g").attr("id", "state").append("svg:text").text("Please click on state")
                    .attr("x", width / 2)
                    .attr("y", height / 2)
                    .attr("text-anchor", "middle")
                    .attr('font-size', '18pt');
            }
        }
    }
    useEffect(() => {
        const loadCsv = d3.csv("http://localhost:5001/state_demographics.csv").then(data => {
            setcsvData(data)
        })
        const loadJson = d3.json("http://localhost:5001/usa-states.json").then(data => {
            setJsonData(data)
        })
        Promise.allSettled([loadCsv,loadJson]).then(()=>{
            setCategory("2010 Population")
        })
    }, [])
    let dropDownItems;
    useEffect(() => {
        renderSvg();
    }, [category])
    if (csvData.length !== 0) {
        dropDownItems = csvData.columns.filter(item => item !== 'State').map(item =>
            <Dropdown.Item key={item} eventKey={item}>{item}</Dropdown.Item>)
    }
    return <>
        <Row>
            <Col className="d-flex justify-content-center mt-2">
                <DropdownButton onSelect={(event) => {
                    setCategory(event)
                }
                } id="dropdown-basic-button" title={`Category: ${category}`}>
                    {dropDownItems}
                </DropdownButton>
            </Col>
        </Row>
        <Row>
            <Col className="col-md-8">
            <svg preserveAspectRatio="xMinYMin meet" ref={svg}>
                <g ref={ref} className="map"></g>
            </svg>
            </Col>
            <Col>
                <svg preserveAspectRatio="xMinYMin meet" ref={presentSvg} />
            </Col>
        </Row></>
}