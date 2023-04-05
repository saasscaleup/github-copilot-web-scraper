// Generate a nodejs script that will get all images from a given url
// and save them to a folder.
// using dependencies: unirest, cheerio, fs
// website url will be passed as a command line argument

const unirest = require('unirest');
const cheerio = require('cheerio');
const fs = require('fs');

const url = process.argv[2];
const folder = process.argv[3];

unirest.get(url).end(function (response) {
    const $ = cheerio.load(response.body);
    const images = $('img');
    let imgArr = [];
    images.each(function (i, image) {
        imgArr.push($(image).attr('src'));
    });
    imgArr = imgArr.filter(function (img) {
        return img.indexOf('http') === 0;
    });
    // get all css background images
    const css = $('style');
    css.each(function (i, style) {
        const matches = $(style).html().match(/url\((.*?)\)/g);
        if (matches) {
            matches.forEach(function (match) {
                imgArr.push(match.replace(/url\((.*?)\)/, '$1'));
            });
        }
    }
    );
    imgArr = imgArr.filter(function (img) {
        return img.indexOf('http') === 0;
    });
    console.log(imgArr);

    // create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    // download images to a local folder and save with the original file name
    // also use encoding null to get binary data
    imgArr.forEach(function (imgUrl) {
        const fileName = imgUrl.split('/').pop();
        unirest.get(imgUrl).encoding(null).end(function (response) {
            console.log(`Downloading ${imgUrl} to ${folder}/${fileName}`);
            fs.writeFile(`${folder}/${fileName}`, response.body, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    });

});