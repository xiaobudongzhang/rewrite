var fs = require('fs');

var invoice = "";
var plays = "";
function playFor(aPerformance){
    return plays[aPerformance.playID]
}
function amountFor(aPerformance){
    let thisAmount = 0;
    switch (playFor(aPerformance).type) {
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
                throw new Error(`unknown type:${playFor(aPerformance).type}`);
    }
    return thisAmount
}
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
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`
  
    const format = new Intl.NumberFormat("en-US",{
        style:"currency",
        currency:"USD",
        minimumFractionDigits:2
    }).format;

    for (let perf of invoice.performances) {
        
        volumeCredits += Math.max(perf.audience - 30, 0);
        if ("comedy" == playFor(perf).type) {
            volumeCredits += Math.floor(perf.audience / 5);
        }

        result += ` ${playFor(perf).name} : ${format(amountFor(perf)/100)}  (${perf.audience} seats)\n`
        totalAmount += amountFor(perf);
    }

    result += `Amount owed is ${format(totalAmount/100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;

}



getFileByPath('plays.json')
.then(function(data){
    plays = JSON.parse(data)
   return getFileByPath('invoices.json');
})
.then(function(data){ 
    invoice = JSON.parse(data)
   console.log(statement(invoice[0], plays));
})
.catch(function(err){
    console.log('err:' + err);
})
