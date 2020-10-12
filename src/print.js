const fs = require("fs");
const path = require("path");
const printer = require("pdf-to-printer");
const fetch = require("node-fetch");

function printAPI(request, response) {
  function onSuccess() {
    response.send({ status: "completed" });
  }

  function onError(error) {
    response.send({ status: "error", error });
  }

  fetch(request.body.url)
    .then(res => res.buffer())
    .then(buffer => {
      const pdf = save(buffer);
      printer
        .print(pdf, {
          printer: request.body.printer,
          win32: ['-print-settings monochrome,1,2x']
        })
        .then(onSuccess)
        .catch(onError)
        .finally(() => remove(pdf));
    });
}

function printFile(fileName, printerName, options) {
  return new Promise((resolve, rejects) => {
    try {
      const buffer = fs.readFileSync(path.join(__dirname, "/storage/" + fileName))
      const pdf = save(buffer);
      console.log(pdf)
      printer
        .print(pdf, {
          printer: printerName,
          win32: options
        })
        .then(resolve({ status: "completed" }))
        .catch(error => rejects({ status: "error", error }))
        .finally(() => remove(pdf));
    }
    catch (error) {
      rejects({ status: "error", error })
    }
  })
}

function save(buffer) {
  const pdfPath = path.join(__dirname, "./" + randomString() + ".pdf");
  fs.writeFileSync(pdfPath, buffer, "binary");
  return pdfPath;
}

function remove(pdf) {
  fs.unlinkSync(pdf);
}

function randomString() {
  return Math.random()
    .toString(36)
    .substring(7);
}

module.exports = {
  printAPI: printAPI,
  printFile: printFile
};
