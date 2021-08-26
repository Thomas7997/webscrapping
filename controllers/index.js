const fs = require('fs');
const path = require('path');

const scrape = require('website-scraper');

let tags = [];
let otherTagsList = [];

exports.getUriData = (req, res, next) => {
    let options = {
        urls: [`http://${req.params.uris}`],
        directory: './public/sites/' + req.params.uris,
        subdirectories: [
            {
                directory: 'img',
                extensions: ['.jpg', '.png', '.svg']
            },
            {
                directory: 'css',
                extensions: ['.css']
            }
        ],
    };

    scrape(options).then((result) => {
        console.log("Website succesfully downloaded");
        res.json({
            success : true
        });
    }).catch((err) => {
        console.log("An error ocurred", err);
        res.json({
            success : false,
            err
        })
    });
}

function getDataBody(data) {
    return data.slice(data.indexOf("<body"), data.indexOf("</body>") + ("</body>").length);
}

exports.getIndexBody = (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, "../public/sites/", req.params.uris, 'index.html'), {encoding:'utf-8'});
    if (data) {
        const body = getDataBody(data);
        if (body) {
            res.json({
                success : true,
                data : body
            });
        }
    }

    else res.json({
        success : false,
        err : "No data"
    });
}

function gettags(data, tagname) {
    let tag = "";
    let ind = 0;
    let tags = [];
    let startIndex = -1;
    do {
        startIndex = data.indexOf("<" + tagname + " ", ind);
        if (startIndex == -1) {
            startIndex = data.indexOf("<" + tagname + ">", ind);
        }

        tag = data.slice(startIndex, data.indexOf("</"  + tagname + ">", ind) + ("</"  + tagname + ">").length);
        console.log(" - " + tag, ind, startIndex);

        if (tag) {
            tags.push(tag);
            ind = tag.length+startIndex-1;
        }
    } while (tag && startIndex != -1);
    return tags;
}

function countOcc (data, tagname) {
    let startIndex = ind = ct = 0;

    do {
        startIndex = data.indexOf(tagname, ind);
        if (startIndex == -1) {
            startIndex = data.indexOf(tagname, ind);
        }

        // console.log(data, tagname, data.slice(startIndex, ind));

        ind = tagname.length+startIndex-1;
        // console.log(startIndex, ind, ct);
        ct++;
    } while (ind != -1 && startIndex != -1);

    return ct;
}

function findOtherTags (data) {
    let tag = openBalise = closeBalise = tmpTagname = longtag = "";
    let ind = endTimesNeeded = locEndIndex = 0;
    let startIndex = endIndex = startEndIndex = endStartIndex = -1;
    do {
        startIndex = data.indexOf("<", ind);
        if (startIndex != -1) {
            startEndIndex = data.indexOf(" ", startIndex);

            if (startEndIndex == -1) startEndIndex = data.indexOf(">", startIndex);
            tmpTagname = data.slice(startIndex+1, startEndIndex);
            if (tmpTagname) {
                endStartIndex = data.indexOf(">", startEndIndex-1);
                openBalise = data.slice(startIndex, endStartIndex+1);
                const tmpTagnameLength = ("</" + tmpTagname + ">").length;
                endIndex = data.indexOf("</" + tmpTagname + ">", startIndex+openBalise.length);
                longtag = data.slice(startIndex+openBalise.length, endIndex);
                endTimesNeeded = countOcc(longtag, "<" + tmpTagname);

                do {
                    endIndex = data.indexOf("</" + tmpTagname + ">",  locEndIndex);
                    locEndIndex = endIndex+tmpTagnameLength-1;
                    console.log(endIndex, endTimesNeeded);
                    endTimesNeeded--;
                } while (endTimesNeeded/* && locEndIndex != -1*/);

                closeBalise = data.slice(endIndex, endIndex + tmpTagnameLength);
                tag = data.slice(startIndex+openBalise.length, endIndex);

                if (tag) {
                    const obj = { tag, openBalise, closeBalise, tagname : tmpTagname };
                    findOtherTags(tag);
                    otherTagsList.push(obj);
                    console.log(obj);
                    ind = endIndex+("</"  + tmpTagname + ">").length;
                }
            }
        }
    } while (tag && startIndex != -1 && tmpTagname);
}

function gettagsdepth (data, tagname) {
    let tag = "";
    let ind = 0;
    let tags = [];
    let startIndex = -1;
    let otherTags = [];
    do {
        startIndex = data.indexOf("<" + tagname + " ", ind);
        if (startIndex == -1) {
            startIndex = data.indexOf("<" + tagname + ">", ind);
        }

        tag = data.slice(startIndex, data.indexOf("</"  + tagname + ">", ind) + ("</"  + tagname + ">").length);
        console.log(" - " + tag, ind, startIndex);

        if (tag) {
            otherTags = findOtherTags(tag);

            tags.push(tag);
            ind = tag.length+startIndex-1;
        }
    } while (tag && startIndex != -1);
    return {tags, others : otherTags};
}

exports.getBodyChildTag = (req, res, next) => {
    const data = fs.readFileSync(path.join(__dirname, "../public/sites/", req.params.uris, 'index.html'), {encoding:'utf-8'});
    if (data) {
        const body = getDataBody(data);
        if (body) {
            const tags = gettags(body, req.params.tag);
            if (tags) res.json({
                success : true,
                data : tags,
                tags : tags.length
            })
        }
    }

    else res.json({
        success : false,
        err : "No data"
    });
}

exports.getBodyChildsTag = (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, "../public/sites/", req.params.uris, 'index.html'), {encoding:'utf-8'});
    if (data) {
        const body = getDataBody(data);
        if (body) {
            const tags = gettagsdepth(body, req.params.tag);
            if (tags) res.json({
                success : true,
                data : tags,
                tags : tags.length,
                others : otherTagsList
            })
        }
    }

    else res.json({
        success : false,
        err : "No data"
    });
}