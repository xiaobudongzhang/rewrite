var fs = require('fs');

var invoice = "";
var plays = "";

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

function statement(invoice) {
    let result = `Statement for ${invoice.customer}\n`

    for (let perf of invoice.performances) {
        result += ` ${playFor(perf).name} : ${usd(amountFor(perf))}  (${perf.audience} seats)\n`
    }


    result += `Amount owed is ${usd(totalAmount())}\n`;
    result += `You earned ${totalVolumeCredits()} credits\n`;
    return result;
    function totalAmount(){
        let result = 0;
        for (let perf of invoice.performances) {
            totalAmount += amountFor(perf);
        }
        return result;
    }
    function totalVolumeCredits(){
        let result = 0;
        for (let perf of invoice.performances) {
            result += volumeCreditsFor(perf);
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
    
    function volumeCreditsFor(aPerformance){
        let result = 0;
        result += Math.max(aPerformance.audience - 30, 0);
        if ("comedy" == playFor(aPerformance).type) {
            result += Math.floor(aPerformance.audience / 5);
        }
        return result;
    }
    
    
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
}



getFileByPath('plays.json')
.then(function(data){
    plays = JSON.parse(data)
   return getFileByPath('invoices.json');
})
.then(function(data){ 
    invoice = JSON.parse(data)
   console.log(statement(invoice[0]));
})
.catch(function(err){
    console.log('err:' + err);
})
