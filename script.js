const urlBinance = "https://api.binance.com";
const precoAtual = "/api/v3/ticker/price";
const preco24Horas = "/api/v3/ticker/24hr";
const kline = "/api/v3/klines";

var altcoinAberta = 0;
var cotacaoAtualBitcoin = 0;

$( document ).ready(function() {
    //enviarRequisicao(testarRequisicao, 'market/tickers');
    
    var chart = LightweightCharts.createChart(document.getElementById('grafico'), {
        width: 600,
        height: 300,

        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        }
    });

    var candleSeries = chart.addCandlestickSeries();
    
    atualizarPrecoBitcoin();
    atualizarPrecoAltcoin();
    atualizarGrafico(candleSeries);

    setInterval(() => {
        atualizarPrecoBitcoin();
        atualizarPrecoAltcoin();
        atualizarGrafico(candleSeries);
    }, [12000])
    
});

function atualizarPrecoBitcoin() {
    $.ajax({
        type: "GET", 
        url: urlBinance + preco24Horas + "?symbol=BTCBRL",
        dataType: 'json',

        success: function (data) {
            $("#preco-bitcoin")[0].innerHTML = "COTAÇÃO ATUAL: R$ ";
            $("#preco-bitcoin")[0].innerHTML = $("#preco-bitcoin")[0].innerHTML + parseFloat(data.lastPrice).toFixed(2);
            cotacaoAtualBitcoin = parseFloat(data.lastPrice).toFixed(2);

            var indicador = localStorage.getItem("indicadorPrecoNotificacao");
            var preco = localStorage.getItem("precoNotificacao");

            if (indicador && preco) {

                if (indicador == '>') {
                    if (preco <= cotacaoAtualBitcoin) {
                        alert("O bitcoin atingiu o preço de alarme (R$ " + preco + ")")
                        localStorage.removeItem("indicadorPrecoNotificacao")
                        localStorage.removeItem("precoNotificacao")
                    }
                } else if (indicador == '<') {
                    if (preco >= cotacaoAtualBitcoin) {
                        alert("O bitcoin atingiu o preço de alarme (R$ " + preco + ")")
                        localStorage.removeItem("indicadorPrecoNotificacao")
                        localStorage.removeItem("precoNotificacao")
                    }
                }
            }

            var variacaoPorcento = parseFloat(data.priceChangePercent).toFixed(2);
            if (variacaoPorcento > 0) {
                $("#variacao-preco-24")[0].style.color = "#33c42f";
                $("#variacao-preco-24")[0].innerHTML = "+" + variacaoPorcento + '%';
            } else {
                $("#variacao-preco-24")[0].style.color = "#c42f2f";
                $("#variacao-preco-24")[0].innerHTML = variacaoPorcento + '%';
            }
            
            $("#maior-preco-24")[0].innerHTML = "R$ " + parseFloat(data.highPrice).toFixed(2);
            $("#menor-preco-24")[0].innerHTML = "R$ " + parseFloat(data.lowPrice).toFixed(2);

        },
    })

    // $.ajax({
    //     type: "GET", 
    //     url: urlBinance + preco24Horas + "?symbol=BTCBRL",
    //     dataType: 'json',

    //     success: function (data) {
    //         console.log(data);

    //     },
    // })
}

function criarNotificacao() {

    var preco = ($("[name=precoNotificacao]")[0].valueAsNumber).toFixed(2);
    if (preco > cotacaoAtualBitcoin) {
        localStorage.setItem("indicadorPrecoNotificacao", ">")
        localStorage.setItem("precoNotificacao", preco)
    }
    else if (preco < cotacaoAtualBitcoin) {
        localStorage.setItem("indicadorPrecoNotificacao", "<")
        localStorage.setItem("precoNotificacao", preco)
    }
    else {
        localStorage.removeItem("indicadorPrecoNotificacao")
        localStorage.removeItem("precoNotificacao")
        alert("O bitcoin atingiu o preço de alarme (R$ " + preco + ")")
    }

    $('.toast').toast('show')
}

function atualizarGrafico(candleSeries) {

    var dataAtual = new Date();
    var atualDateMili = dataAtual.getTime();
    var anteriorDateMili = dataAtual.setDate(dataAtual.getDate() - 365);

    $.ajax({
        tipe: "GET",
        url: urlBinance + kline + "?symbol=BTCBRL&interval=1d&startTime=" + anteriorDateMili + "&endTime=" + atualDateMili,
        dataType: 'json',
        success: function (data) {

            var dataGraph = []
            data.forEach((kline) => {

                var objectKline= {};
                objectKline.time = parseTime(kline[0]);
                objectKline.open =  kline[1];
                objectKline.high = kline[2];
                objectKline.low = kline[3];
                objectKline.close = kline[4];
                dataGraph.push(objectKline);
            });

            candleSeries.setData(dataGraph);
        }
    })
}

function atualizarPrecoAltcoin() {
    var symbol = '';

    switch (altcoinAberta) {
        case 0:
            symbol="USDT"
        break;

        case 1:
            symbol="ETH"
        break;

        case 2:
            symbol="XRP"
        break;

        case 3:
            symbol="LTC"
        break;

        case 4:
            symbol="DOGE"
        break;
    }

    $.ajax({
        type: "GET",
        url: urlBinance + preco24Horas + `?symbol=${symbol}BRL`,
        dataType: 'json',

        success: function (data) {
            //console.log(data);
            $(".preco-altcoin")[altcoinAberta].innerHTML = parseFloat(data.lastPrice).toFixed(4);
            $(".variacao-altcoin-24")[altcoinAberta].innerHTML = parseFloat(data.lastPrice).toFixed(4);
            var variacaoPorcento = parseFloat(data.priceChangePercent).toFixed(2);
            if (variacaoPorcento > 0) {
                $(".variacao-altcoin-24")[altcoinAberta].style.color = "#33c42f";
                $(".variacao-altcoin-24")[altcoinAberta].innerHTML = "+" + variacaoPorcento + '%';
            } else {
                $(".variacao-altcoin-24")[altcoinAberta].style.color = "#c42f2f";
                $(".variacao-altcoin-24")[altcoinAberta].innerHTML = variacaoPorcento + '%';
            }
        }
    })
}

function parseTime(milisseconds) {
    var aux = new Date(milisseconds);
    var string = aux.getFullYear() + "-" + (aux.getMonth() + 1) + "-" + aux.getDate();
    //var string = aux.getHours() + ":" + aux.getMinutes() + ":" + aux.getSeconds();

    return string;
}

function setAltcoin(altcoin) {
    altcoinAberta = altcoin;
    atualizarPrecoAltcoin();
}