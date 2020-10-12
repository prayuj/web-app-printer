const fs = require("fs")
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const formidable = require('formidable')
const chalk = require('chalk');
const print = require("./src/print");
const list = require("./src/list");
const ip = require("./src/ip-addr")

var stdin = process.openStdin();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'))
})
app.post("/print", print.printAPI);

app.get("/list", list);

app.get("/pageSizes", (req, res) => {
    res.send(JSON.parse(fs.readFileSync('page_sizes.json'), 'utf-8'))
})

app.post("/postForm", (req, res) => {
    console.log(req.body)
    var printSettings = '-print-settings ' + req.body.color + ',' + (req.body.pages === 'all' ? '' : req.body.range) + ',' + req.body.copies + 'x' + ',paper=ws_nat'
    console.log(printSettings)
    print.printFile(req.body.fileName, req.body.printer, [printSettings]).then(result =>
        res.status(200).json(result)
    ).catch(err => {
        console.log(err)
        res.status(400).json({ err })
    })
})

app.post('/file', function (req, res) {
    try {
        var form = new formidable.IncomingForm();
        form.parse(req);

        form.on('fileBegin', function (name, file) {
            file.path = __dirname + '/src/storage/' + file.name;
        });

        form.on('file', function (name, file) {
            console.log('Uploaded ' + file.name);
            res.status(200).json({ status: 'uploaded', fileName: file.name });
        });
    }
    catch (e) {
        console.log(e)
        res.status(400).json({ status: 'fail' })
    }


});

var wifiIP;
try {
    wifiIP = ip.getIPAddr()['Wi-Fi'][0] || 'Not Set';
}
catch (e) {
    wifiIP = 'Not Set';
}

const port = 8000;

console.log(chalk.white.bgRed.bold(`\nDO NOT CLOSE THIS WINDOW\n`))

app.listen(port, () => {
    console.log(chalk.white.bgGreen.bold(`Go to http://localhost:${port} to access on this machine.\n`))
    if (wifiIP === 'Not Set')
        console.log(chalk.white.bgRed.bold(`Connect to Wifi to access on other machines on the network\nPress Enter to refresh\n`))
    else
        console.log(chalk.white.bgGreen.bold(`Go to http://${wifiIP}:${port} to access on other machines on the network\n`))
});

stdin.addListener("data", function (d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 

    try {
        wifiIP = ip.getIPAddr()['Wi-Fi'][0] || 'Not Set';
    }
    catch (e) {
        wifiIP = 'Not Set';
    }

    if (wifiIP === 'Not Set')
        console.log(chalk.white.bgRed.bold(`Connect to Wifi to access on other machines on the network\nClick any key to check to refresh.\n`))
    else
        console.log(chalk.white.bgGreen.bold(`Go to http://${wifiIP}:${port} to access on other machines on the network.\n`))

});