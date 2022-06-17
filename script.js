var chart;

genEmptyChart();

var commodityList = document.querySelector("#commodities");
var maPeriod = document.querySelector("#ma-period");
var genBtn = document.querySelector("#generate");

genBtn.addEventListener("click", () => 
{
    var commodity = commodityList.value;
    var period = parseInt(maPeriod.value);

    updateChart(chart, commodity, period)
})

var candlesChkbx = document.querySelector("#candles");
var priceChkbx = document.querySelector("#price");
var sslChannelChkbx = document.querySelector("#ssl-channel");

toggleSeriesOnCheck(candlesChkbx, "Candlestick");
toggleSeriesOnCheck(priceChkbx, "Price");
toggleSeriesOnCheck(sslChannelChkbx, "Low-MA", "High-MA");

function toggleSeriesOnCheck(checkbox, series, series1)
{
    if (series1)
    {
        checkbox.addEventListener("click", () => 
        {
            if (checkbox.checked === true)
            {
                chart.showSeries(series)
                chart.showSeries(series1)
            } else if (checkbox.checked === false)
            {
                chart.toggleSeries(series);
                chart.toggleSeries(series1);
            }
        })
    } else
    {
        checkbox.addEventListener("click", () => 
        {
            if (checkbox.checked === true)
            {
                chart.showSeries(series)
            } else if (checkbox.checked === false)
            {
                chart.toggleSeries(series);
            }
        })
    }
   
}


function updateChart(chart, commodity, period)
{
    var ajaxData = getAjaxData(commodity);

    ajaxData.done(function(rawData)
    {
        var seriesObj = ajaxToSeries(rawData, period);

        chart.updateSeries(seriesObj);
    });
}

function genEmptyChart()
{
    var options = 
    {
        chart: 
        {
            height: 350,
            type: 'line',
        },
        dataLabels: 
        {
            enabled: false
        },
        series: [],
        noData: 
        {
          text: 'Please select inputs...'
        },
        stroke: 
        {
            width: [2, 2, 2, 2],
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
            palette: 'palette2', 
            monochrome: 
            {
                enabled: false,
                color: '#255aee',
                shadeTo: 'light',
                shadeIntensity: 0.65
            }
        }
    }
      
    chart = new ApexCharts(document.querySelector("#chart-one"),options);
      
    chart.render();
}

function getAjaxData(commodity)
{
    return $.ajax
    ({
        url: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${commodity}&outputsize=compact&apikey=6N35E4TZCRQWCQMW`
    })
}

function ajaxToSeries(rawData, period)
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

    var seriesObj = genSeriesObj(candleDataset, maLowDataset, maHighDataset, priceCloseDataset);

    return seriesObj;
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

function genSeriesObj(candle, maSet1, maSet2, priceSet)
{
    var seriesObj = 
    [{
        name: 'Candlestick',
        type: 'candlestick',
        data: candle
    },
    {
        name: 'Low-MA',
        type: 'line',
        data: maSet1
    },
    {
        name: 'High-MA',
        type: 'line',
        data: maSet2
    },
    {
        name: 'Price',
        type: 'line',
        data: priceSet
    }]

    return seriesObj;
}

