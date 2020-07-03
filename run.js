var fs = require('fs');
var http = require('http');


fs.openSync('results.txt', 'w')
var file = fs.readFileSync('./data.txt').toString().split('\r\n');
var len = file.length;
// var len =200;

let return_num = 0;

let ss = 0;

function get(ss, max_hold, sleep_time = 5) {
    let x = file[ss];

    const url = 'http://localhost:8900';

    console.log(`第 ${ss+1} 次请求开始`)
    http.get(url, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            return_num += 1
            data = JSON.parse(data)
            fs.appendFile('results.txt', `${x}|${data}\r\n`, () => {
                console.log(`第${ss+1}次请求返回数据添加成功`)
            })
        });
    })
    if (ss < len - 1) {
        let next_num = ss + 1;
        if (ss % 100 === 0 && ss > 0) {
            // 如果 ss 新更新100个，则异步执行一下，将后面阻塞的返回加入执行队列
            setTimeout(() => {
                setTimeout(get,0,next_num, max_hold, sleep_time)
            })
        } else if (ss - return_num > max_hold) {
            // 如果 请求数比返回数大max_hold，说明同时程序在等待max_hold个请求返回，此时等待 sleep_time 秒后执行，增加延长时间
           setTimeout(get, sleep_time * 1000 ,next_num, max_hold, sleep_time)
        } else {
            get(next_num, max_hold, sleep_time)
        }
    }
}

get(ss,500,5)
