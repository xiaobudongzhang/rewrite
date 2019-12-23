var fs = require('fs');



function getFileByPath(path){
    return new Promise(function(resolve, reject){
        fs.readFile(path,'utf8',function (err, data) {
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        });
        
    });
}
function statement(invoice, plays) {
    const statementData = {}
    statementData.customer = invoice.customer
    statementData.performances = invoice.performances.map(enrichPerformance)
    statementData.totalAmount = totalAmount(statementData)
   return renderPlainText(statementData, plays);

    function enrichPerformance(aPerformance){
        const result = Object.assign({}, aPerformance);
        result.play = playFor(result)
        result.amount = amountFor(result)
        result.volumeCredits = volumeCreditsFor(result)
        return result;
    }
    function playFor(aPerformance){
        return plays[aPerformance.playID]
    }

    function amountFor(aPerformance){
        let thisAmount = 0;
        switch (aPerformance.play.type) {
            case "tragedy":
                thithisAmount = 40000;
                if (aPerformance.audience > 30) {
                    thisAmount += 1000 * (aPerformance.audience -30)
                }
                break;
            case "comedy":
                thisAmount = 30000;
                if (aPerformance.audience > 20) {
                    thisAmount += 1000 + 500 * (aPerformance.audience -20)
                }
                thisAmount += 300 * aPerformance.audience
                break;
                default:
                    throw new Error(`unknown type:${aPerformance.play.type}`);
        }
        return thisAmount
    }
    function volumeCreditsFor(aPerformance){
        let result = 0;
        result += Math.max(aPerformance.audience - 30, 0);
        if ("comedy" == aPerformance.play.type) {
            result += Math.floor(aPerformance.audience / 5);
        }
        return result;
    }
    function totalAmount(data){
        let result = 0;
        for (let perf of data.performances) {
            totalAmount += perf.amount;
        }
        return result;
    }
}
function renderPlainText(data, plays) {
    let result = `Statement for ${data.customer}\n`
    for (let perf of data.performances) {
        result += ` ${perf.play.name} : ${usd(perf.amount)}  (${perf.audience} seats)\n`
    }

    result += `Amount owed is ${usd(data.totalAmount)}\n`;
    result += `You earned ${totalVolumeCredits()} credits\n`;
    return result;
    function totalVolumeCredits(){
        let result = 0;
        for (let perf of data.performances) {
            result += perf.volumeCredits;
        }
        return result;
    }
    function usd(aNumber){
        return new Intl.NumberFormat("en-US",{
            style:"currency",
            currency:"USD",
            minimumFractionDigits:2
        }).format(aNumber/100)
    }
}


var playsData = ''
getFileByPath('plays.json')
.then(function(data){
    playsData = JSON.parse(data)
   return getFileByPath('invoices.json');
})
.then(function(data){ 
    invoice = JSON.parse(data)
   console.log(statement(invoice[0], playsData));
})
.catch(function(err){
    console.log('err:' + err);
})
