/**
 *  数据来源于【触屏版京东】
 *  https://p.m.jd.com/norder/address.action
 */
var async = require('async'),
    request = require('request'),
    fs = require('fs'),
    path = require('path');

var provinceArr = [
        {name: '北京', id: '1'}, {name: '上海', id: '2'}, {name: '天津', id: '3'}, {name: '重庆', id: '4'},
        {name: '河北', id: '5'}, {name: '山西', id: '6'}, {name: '河南', id: '7'}, {name: '辽宁', id: '8'},
        {name: '吉林', id: '9'}, {name: '黑龙江', id: '10'}, {name: '内蒙古', id: '11'}, {name: '江苏', id: '12'},
        {name: '山东', id: '13'}, {name: '安徽', id: '14'}, {name: '浙江', id: '15'}, {name: '福建', id: '16'},
        {name: '湖北', id: '17'}, {name: '湖南', id: '18'}, {name: '广东', id: '19'}, {name: '广西', id: '20'},
        {name: '江西', id: '21'}, {name: '四川', id: '22'}, {name: '海南', id: '23'}, {name: '贵州', id: '24'},
        {name: '云南', id: '25'}, {name: '西藏', id: '26'}, {name: '陕西', id: '27'}, {name: '甘肃', id: '28'},
        {name: '青海', id: '29'}, {name: '宁夏', id: '30'}, {name: '新疆', id: '31'}, {name: '台湾', id: '32'},
        {name: '钓鱼岛', id: '84'}, {name: '港澳', id: '52993'}
    ],
    cityArr = [],
    areaArr = [];

var fetchCity = function (callback) {
    var arr = [];

    provinceArr.forEach(function (val) {
        arr.push({
            id: val.id,
            link: 'http://home.m.jd.com/address/area.action?idProvince=' + val.id,
            name: val.name
        });
    });

    async.mapLimit(arr, 10, function (item, callback) {
        console.log('正在抓取城市【' + item.name + '】的数据...');
        request(item.link, function (error, response, body) {
            callback(error, {provinceId: item.id, arr: eval(body)});
        });
    }, function (err, results) {
        if (err) {
            typeof callback === 'function' && callback(err);
            return;
        }
        cityArr = results;
        fetchArea(callback);
    });
};

var fetchArea = function (callback) {
    var arr = [];
    for (var i = 0; i < cityArr.length; i++) {
        var t = cityArr[i].arr;
        for (var j = 0; j < t.length; j++) {
            arr.push({id: t[j].id, link: 'http://home.m.jd.com/address/area.action?idCity=' + t[j].id, name: t[j].name})
        }
    }

    async.mapLimit(arr, 10, function (item, callback) {
        console.log('正在抓取县级【' + item.name + '】的数据...');
        request(item.link, function (error, response, body) {
            callback(error, {cityId: item.id, arr: eval(body)});
        });
    }, function (err, results) {
        if (err) {
            typeof callback === 'function' && callback(err);
            return;
        }
        areaArr = results;
        callback();
    });
};

var pickItems = function (widthID, widthArea) {
    var arr = [];
    provinceArr.forEach(function (pp) {

        var _province = {};
        if (widthID) _province.v = pp.id;
        _province.n = pp.name;
        _province.c = [];

        cityArr.every(function (city) {
            if (pp.id == city.provinceId) {
                city.arr.forEach(function (area) {

                    var _city = {};
                    if (widthID) _city.v = area.id;
                    _city.n = area.name;

                    if (widthArea) {
                        _city.c = [];
                        areaArr.every(function (_area) {
                            if (area.id == _area.cityId) {
                                _area.arr.forEach(function (e) {
                                    var a = {};
                                    if (widthID) a.v = e.id;
                                    a.n = e.name;
                                    _city.c.push(a);
                                });
                                return false;
                            }
                            return true;
                        });
                    }

                    _province.c.push(_city);
                });
                return false;
            }
            return true;
        });
        arr.push(_province);
    });

    return '!function(){var citys=' + JSON.stringify(arr) + ';if(typeof define==="function"){define(citys)}else{window.YDUI_CITYS=citys}}();';
};

fetchCity(function () {
    fs.writeFile(path.resolve(__dirname, '../dist/jd_province_city_area_id.js'), pickItems(true, true), function () {
        console.log('JD:【省市县 + ID 】文件生成成功！');
    });

    fs.writeFile(path.resolve(__dirname, '../dist/jd_province_city_area.js'), pickItems(false, true), function () {
        console.log('JD:【省市县】文件生成成功！');
    });

    fs.writeFile(path.resolve(__dirname, '../dist/jd_province_city_id.js'), pickItems(true, false), function () {
        console.log('JD:【省市 + ID】文件生成成功！');
    });

    fs.writeFile(path.resolve(__dirname, '../dist/jd_province_city.js'), pickItems(false, false), function () {
        console.log('JD:【省市】文件生成成功！');
    });
});
