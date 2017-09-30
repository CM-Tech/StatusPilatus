/*
*    StatusPilatus: Monitor your PC like never before!
*    Copyright (C) 2017 PilatusDevs
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

/* set the config for the graph */

/**
* Called when someone clicks cpu in the sidebar
*/
function initCpu() {
    si.cpu()
    .then(data => {
        $("#subtitle").text(data.manufacturer+" "+data.brand)
    });
    console.log("initCpu");

    si.currentLoad()
    .then(data => {
        if (configUsage.data.datasets.length == 1) {
            for (var c = 0; c < data.cpus.length; c++) {
                configUsage.data.datasets.push({
                    label: "Thread " + (c + 1),
                    backgroundColor: "#ddd",
                    borderColor: "#ddd",
                    fill: false,
                    borderWidth: 0.5,
                    pointRadius: 1
                });
            }
        }
        var ctx = document.getElementById("canvasCpuUsage").getContext("2d");
        window.cpuUsage = new Chart(ctx, configUsage);
    });

    var ctx = document.getElementById("canvasCpuTemperature").getContext("2d");
    window.cpuTemperature = new Chart(ctx, configTemperature);
}

/**
* Called in a loop in app.js
*/
function refreshCpu() {
    console.log("CPU refresh");
    refreshCpuUsage();
    refreshCpuTemperature();
}

function graph_width() {
    return 30;
}

/**
* Update the cpu temperature chart
*/
function refreshCpuUsage() {
    /* get the cpu information */
    var usage;

    si.currentLoad()
    .then(data => {
        /* update the graph - average*/
        configUsage.data.labels.push("");
        console.log(data.currentload);
        configUsage.data.datasets[0].data.push(data.currentload);
        if (configUsage.data.datasets[0].data.length > graph_width()) {
            configUsage.data.datasets[0].data.splice(0, 1);
            configUsage.data.labels.splice(0, 1);
        }
        /* update the graph - per thread */
        for (var s = 0; s < configUsage.data.datasets.length - 1; s++) {
            console.log(data.cpus[s]);
            configUsage.data.datasets[s+1].data.push(data.cpus[s].load);
            if (configUsage.data.datasets[s+1].data.length > graph_width()) {
                configUsage.data.datasets[s+1].data.splice(0, 1);
            }
        }
        console.log(configUsage);
        window.cpuUsage.update();
    });
}

/*
* Update the cpu Temperature chart
* TODO: On windows the temperature aint right
*/
function refreshCpuTemperature(){
    console.log("temperature");
    var temperature;

    si.cpuTemperature()
    .then(data => {
        temperature = data.max;

        console.log(data);
        /* update the graph */
        configTemperature.data.labels.push("");
        configTemperature.data.datasets.forEach(function(dataset) {
            dataset.data.push(parseInt(temperature));
            /* Delete a value at the beginning of the graph to make it 30 items */
            if (dataset.data.length > 31) {
                dataset.data.splice(0, 1);
                configTemperature.data.labels.splice(0, 1);
            }
        });
        window.cpuTemperature.update();
    });
}

/*
* Config for the Usage chart
*/
var configUsage = {
    type: 'line',
    data: {
        datasets: [{
            label: "Average",
            backgroundColor: "#f38b4a",
            borderColor: "#f38b4a",
            fill: false,
        }]
    },
    options: {
        responsive: true,
        title:{
            display:false,
            text:'Chart.js Line Chart'
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Usage'
                }
            }],
            yAxes: [{
                ticks:{
                    min : 0,
                    max : 100,
                    stepSize : 10,
                },
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: 'Value'
                }
            }]
        }
    }
};

/*
* Config for the Temperature chart
*/
var configTemperature = {
    type: 'line',
    data: {
        datasets: [{
            label: "Average",
            backgroundColor: "#f38b4a",
            borderColor: "#f38b4a",
            fill: false,
        }]
    },
    options: {
        responsive: true,
        title:{
            display:false,
            text:'Chart.js Line Chart'
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Temperature'
                }
            }],
            yAxes: [{
                ticks:{
                    min : 0,
                    max : 100,
                    stepSize : 10,
                },
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: 'Value'
                }
            }]
        }
    }
};