/**
 *  数据来源于【国家统计局】
 *  http://www.stats.gov.cn/tjsj/tjbz/xzqhdm
 */
var http = require('http'),
    fs = require('fs'),
    path = require('path');

var pkg = require('../package.json');

var link = 'http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/201703/t20170310_1471429.html';

var describe = '/* ' + pkg.name + ' v' + pkg.version + ' by YDCSS (c) ' + new Date().getFullYear() + ' Licensed ' + pkg.license + ' */\n';

var missingData = require('./missing.json');

var fetchItems = function (callback) {

    console.log('gov: 数据抓取中...');

    http.get(link, function (res) {
        var rawData = '';
        var statusCode = res.statusCode;

        if (statusCode !== 200) {
            res.resume();
            return callback(new Error('Request Failed. '));
        }

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            rawData += chunk;
        });

        res.on('end', function () {
            var reg = /<p class="MsoNormal">(.*?)<span lang="EN-US">(.*?)<span>(?:&nbsp;)+ <\/span><\/span>(?:<\/b>)?(?:<b>)?<span style="font-family: 宋体">(.*?)<\/span>(.*?)<\/p>/g;
            return callback(null, rawData.match(reg));
        })
    }).on('error', callback);
};

var pickItems = function (items, withID, withArea) {
    var result = [],
        provinceIndex = 0,
        areaIndex = 0;

    items.forEach(function (item) {
        var reg = /<span lang="EN-US">(.*?)<span>(?:&nbsp;)+ <\/span><\/span>(?:<\/b>)?(?:<b>)?<span style="font-family: 宋体">(.*?)<\/span>/g;
        var c = reg.exec(item);

        var value = c[1].trim();
        var name = c[2].trim();

        var obj = {};
        if (withID) obj.v = value;
        obj.n = name;
        obj.c = [];

        if (/<b>/g.test(item)) {
            areaIndex = 0;
            result[provinceIndex] = obj;
            ++provinceIndex;
        } else if (/(&nbsp;){6}/g.test(item)) {
            result[provinceIndex - 1].c.push(obj);
            ++areaIndex;
            if(withArea) {
                // 中山市、东莞市、三沙市、儋州市，在国家统计局表里没有下级数据，手动添加
                if (obj.n === '中山市' || obj.n === '东莞市' || obj.n === '三沙市' || obj.n === '儋州市') {
                    obj.c = missingData[obj.n].c;
                }
            }
        } else {
            if (withArea) {
                var j = {};
                if (withID) j.v = value;
                j.n = name;
                result[provinceIndex - 1].c[areaIndex - 1].c.push(j);
            }
        }
    });

    return describe + '!function(){var district=' + JSON.stringify(result) + ';if(typeof define==="function"){define(district)}else{window.YDUI_DISTRICT=district}}();';
};

fetchItems(function (error, ret) {
    if (error) {
        console.log(error);
        return;
    }

    fs.writeFile(path.resolve(__dirname, '../dist/gov_province_city_area_id.js'), pickItems(ret, true, true), function () {
        console.log('gov:【省市县 + ID】文件生成成功！');
    });

    fs.writeFile(path.resolve(__dirname, '../dist/gov_province_city_area.js'), pickItems(ret, false, true), function () {
        console.log('gov:【省市县】文件生成成功！');
    });

    fs.writeFile(path.resolve(__dirname, '../dist/gov_province_city_id.js'), pickItems(ret, true, false), function () {
        console.log('gov:【省市 + ID】文件生成成功！');
    });

    fs.writeFile(path.resolve(__dirname, '../dist/gov_province_city.js'), pickItems(ret, false, false), function () {
        console.log('gov:【省市】文件生成成功！');
    });
});
