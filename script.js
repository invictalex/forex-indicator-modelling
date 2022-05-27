
displayChart("XAUUSD", 10);

var commodityList = document.querySelector("#commodities");
var maPeriod = document.querySelector("#ma-period");
var genBtn = document.querySelector("#generate");

genBtn.addEventListener("click", () => 
{
    document.querySelector("#chart-one").innerHTML = "";

    var selectedCommodity = commodityList.value;
    var selectedPeriod = parseInt(maPeriod.value);

    displayChart(selectedCommodity, selectedPeriod);
});



/*------------------------------------FUNCTIONS------------------------------*/


function displayChart(commodity, period)
{
    $.ajax
    ({
        url: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${commodity}&outputsize=compact&apikey=6N35E4TZCRQWCQMW`
        
    }).done(function(rawData)
    {
        var timeSeries = rawData["Time Series (Daily)"];
        var high = "2. high";
        var low = "3. low";
        var close = "4. close";

        var dateRange = 
        {
            start: 99,
            end: 0,
        }

        var dateArr = getDateArr(timeSeries, dateRange);              /*X AXIS ARRAY - DATESERIES*/

        var priceCloseArr = getValArr(timeSeries, dateRange, close);       /*Y AXIS VALUE ARRAYS*/
        var priceLowArr = getValArr(timeSeries, dateRange, low);
        var priceHighArr = getValArr(timeSeries, dateRange, high);
        var maLowArr = calcMovingAverage(priceLowArr, period);
        var maHighArr = calcMovingAverage(priceHighArr, period);

        var candleDataset = createCandleChartDataset(timeSeries, dateRange, dateArr);  /*DATASETS READY TO BE CHARTED*/
        var maLowDataset = createLineChartDataset(dateArr, maLowArr, period);
        var maHighDataset = createLineChartDataset(dateArr, maHighArr, period);
        var priceCloseDataset = createLineChartDataset(dateArr, priceCloseArr, period);

        generateChart(candleDataset, priceCloseDataset, maLowDataset, maHighDataset);
    });
}

function getDateArr(data, dateRange)
{
    var dateArr = [];

    for (let i = dateRange["start"]; i >= dateRange["end"]; i--)
    {
        var tradeDate = new Date(Object.keys(data)[i]);
        dateArr.push(tradeDate);
    }

    return dateArr;
}

function getDateRange(data, startDate, endDate, period)
{
    dateArr = Object.keys(data);

    var dateRange = 
    {
        start: dateArr.indexOf(startDate),
        end: dateArr.indexOf(endDate),
        maStart: (dateArr.indexOf(startDate) - period + 1)
    }

    return dateRange;
}

function getValArr(data, dateRange, option)
{
    var arr = [];

    for (let i = dateRange["start"]; i >= dateRange["end"]; i--)
    {
        var tradeDate = Object.keys(data)[i];
        var newPrice = data[tradeDate][option];
        var newPriceNum = parseFloat(newPrice);
        arr.push(newPriceNum);
    }
    return arr;
}

function calcMovingAverage(valArr, period)
{
    var maArr = [];

    for (let i = period -1 ; i < valArr.length; i++)
    {
        var sum = 0;
        var rangeLower = i - period + 1;

        for (let j = i; j >= rangeLower; j--)
        {
            sum += valArr[j];
        }
        
        var newAverageVal = sum/period;

        maArr.push(newAverageVal);
    }
    return maArr;
}

function createCandleChartDataset(data, dateRange, dateArr)
{
    var candleDataset = [];
    var dateArrIndex = 0;

    for (let i = dateRange["start"]; i >= dateRange["end"]; i--)
    {
        var tradeDate = Object.keys(data)[i];
        var openVal = data[tradeDate]["1. open"];
        var highVal = data[tradeDate]["2. high"];
        var lowVal = data[tradeDate]["3. low"];
        var closeVal = data[tradeDate]["4. close"];

        var newDataPoint = 
        {
            x: dateArr[dateArrIndex],
            y: [openVal, highVal, lowVal, closeVal]
        }
        candleDataset.push(newDataPoint);
        dateArrIndex++;
    }

    return candleDataset;
}

function createLineChartDataset(dateArr, valArr, period)
{
    var dataset = [];

    if (valArr.length < dateArr.length)     /* i.e. if the values array contains moving average data*/
    {
        for (let i = 0; i < valArr.length; i++)
        {
            var newDataPoint = 
            {
                x: dateArr[i + period - 1],
                y: valArr[i]
            }
            dataset.push(newDataPoint);
        }
    }
    else
    {
        for (let i = 0; i < valArr.length; i++)
        {
            var newDataPoint = 
            {
                x: dateArr[i],
                y: valArr[i]
            }
            dataset.push(newDataPoint);
        }
    }

    return dataset;
}

function generateChart(candleSet, priceSet, maSet1, maSet2)
{
    var chartObject = 
    {
        series: 
        [{
            name: 'Candlestick',
            type: 'candlestick',
            data: candleSet
        },
        {
            name: 'Price',
            type: 'line',
            data: priceSet
        },
        {
            name: 'Low MA',
            type: 'line',
            data: maSet1
        },
        {
            name: 'High MA',
            type: 'line',
            data: maSet2
        }],
        chart: 
        {
            height: 350,
            type: 'line',
        },
        title: 
        {
            text: 'CandleStick Chart',
            align: 'left'
        },
        stroke: 
        {
            width: [2, 2, 2],
        },
        tooltip:
        {
            enabled: false
        },
        xaxis: 
        {
        type: 'datetime'
        },
        theme: 
        {
            mode: 'dark', 
            palette: 'palette1', 
            monochrome: 
            {
                enabled: false,
                color: '#255aee',
                shadeTo: 'light',
                shadeIntensity: 0.65
            }
        }
    }
    var chart = new ApexCharts(document.querySelector("#chart-one"), chartObject);
    chart.render();

    chart.toggleSeries("Price");
    chart.toggleSeries("Low MA");
    chart.toggleSeries("High MA");

    var candleCB = document.getElementById("candles");
    var priceCB = document.getElementById("price");
    var sslChannelCB = document.getElementById("ssl-channel");

    candleCB.addEventListener("change", () => chart.toggleSeries("Candlestick"));
    priceCB.addEventListener("change", () => chart.toggleSeries("Price"));
    sslChannelCB.addEventListener("change", () => 
    {
        chart.toggleSeries("Low MA");
        chart.toggleSeries("High MA");
    });
    
}
