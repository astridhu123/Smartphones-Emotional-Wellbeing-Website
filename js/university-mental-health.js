// Path to file: data\A pandemic of Mental Health\Reported Anxiety and Depression Symptoms\anx_and_dep\anx_or_dep_2019_vs_2020.csv

class UniversityStudentHealthChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        let parseDate = d3.timeParse("%Y-%m-%d");

        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 20, right: 20, bottom: 20, left: 50};

        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.width = 600;
        vis.height = 500;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (vis.margin.left) + "," + vis.margin.top + ")"); 



        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;
        
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

    }
}