const readline = require('readline');
const http = require('http');
const cheerio = require('cheerio')
const url = require('url');
const rp = require('request-promise');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter cnn link: ',
    (urlString) => {
        //get page html
        http.get({
            host: url.parse(urlString).host,
            path: url.parse(urlString).path,
            method: 'GET'
        },
            function (resp) {
                resp.on('data', function (chunk) {
                    //use jq in html
                    let $ = cheerio.load(chunk)
                    //select data structur
                    let articleObj = $('[data-article-id]')[0];
                    if (articleObj) {
                        //get article id
                        let articleId = articleObj.attribs['data-article-id'];
                        if (articleId) {
                            //for translate base64
                            const buf = Buffer.from(articleId, 'utf-8');

                            var count = 1;
                            rp({
                                uri: `http://cnn.bootstrap.fyre.co/bs3/v3.1/cnn.fyre.co/353270/${buf.toString('base64')}/init`,
                                transform: function (body) {
                                    let jsonData = JSON.parse(body);
                                    //show all messages
                                    jsonData["headDocument"]["content"].forEach(function (element) {
                                        console.log("Message #" + count);
                                        console.log(element.content.bodyHtml);
                                        console.log();
                                        count++;
                                    }, this);
                                    return;
                                }
                            })
                                .then(function ($) {
                                    console.log("Total message = ", count)
                                })
                                .catch(function (err) {
                                    console.log("Got error: " + err);
                                });
                        }
                    }
                });
            })
            .on("error", function (e) {
                console.log("Got error: " + e.message);
            });

        rl.close();
    });