$.ajax
({
    url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=XAUUSD&outputsize=compact&apikey=6N35E4TZCRQWCQMW"
    
}).done(function(rawData)
{
    var startDate = "2022-05-05";
    var endDate = "2022-05-22";
    var timeSeries = rawData["Time Series (Daily)"];
    var maPeriod = 10;

    var startDateIndex = getStartDateIndex(timeSeries, startDate);
    var endDateIndex = getEndDateIndex(timeSeries, endDate);

    getCandlestickData(timeSeries, startDateIndex, endDateIndex);

    var priceArr = [];
    var maArr = [];
    var maDataSet = [];

    populatePriceArr(timeSeries, startDateIndex, endDateIndex, priceArr);
    
    populateMAarr(priceArr, maPeriod, maArr);

    populateMAdataset(timeSeries, startDateIndex, endDateIndex, maArr, maDataSet);


    
});

function getStartDateIndex(data, startDate)
{
    dateArr = Object.keys(data);
    return dateArr.indexOf(startDate);
}

function getEndDateIndex(data, endDate)
{
    dateArr = Object.keys(data);
    return dateArr.indexOf(endDate);
}

function getCandlestickData(data, startDateIndex, endDateIndex)
{
    var candleDataSet = [];

    for (let i = startDateIndex; i >= endDateIndex; i--)
    {
        var tradeDate = Object.keys(data)[i];
        var openVal = data[tradeDate]["1. open"];
        var highVal = data[tradeDate]["2. high"];
        var lowVal = data[tradeDate]["3. low"];
        var closeVal = data[tradeDate]["4. close"];

        var newDataPoint = 
        {
            x: new Date(tradeDate),
            y: [openVal, highVal, lowVal, closeVal]
        }
        candleDataSet.push(newDataPoint);
    }
    console.log(candleDataSet);
}

function populatePriceArr(data, startDateIndex,endDateIndex, outputArr)
{
    for (let i = startDateIndex; i >= endDateIndex; i--)
    {
        var tradeDate = Object.keys(data)[i];
        var newPrice = data[tradeDate]["4. close"];
        var newPriceNum = parseFloat(newPrice);
        outputArr.push(newPriceNum);
    }
}

function populateMAarr(arr, range, outputArr)
{
    for (let i = 0; i <= arr.length - range; i++)
    {
        var sumRange = 0;
        var rangeLower = i;
        var rangeUpper = i+range-1;

        for (let j = rangeLower; j <= rangeUpper; j++)
        {
            sumRange += arr[j];
        }
        
        var newRangeAverage = sumRange/10;

        outputArr.push(newRangeAverage);
    }
}

function populateMAdataset(data, startDateIndex, endDateIndex, maArr, outputArr)
{
    var maDataIndex = 0;
    var maDataSet = [];
    
    for (let i = startDateIndex; i > startDateIndex - maArr.length; i--)
    {
        var date = Object.keys(data)[i];
        var maDataPoint = maArr[maDataIndex];

        maDataIndex++;

        var newDataPoint = 
        {
            x: new Date(date),
            y: maDataPoint
        }

        outputArr.push(newDataPoint);
    }

    console.log(outputArr);
}
