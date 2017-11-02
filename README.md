# ydui-district

### 中国省市县数据：省份、城市、区县，共两种数据源8个版本
*   数据来源1（国家统计局） - [中华人民共和国国家统计局-行政区划代码](http://www.stats.gov.cn/tjsj/tjbz/xzqhdm/)
*   数据来源2（京东） - [京东触屏版](https://p.m.jd.com/norder/address.action)

### 数据源各自优点
*   京东数据源更灵活，更贴切实际，更详细，当然文件也相对大一点，ID为京东自己的算法；（例：北京 => 1, 上海 => 2）
*   国家统计局数据，ID为区域代码，方便与其他数据源对应；（例：北京市 => 110000）

### 特别说明
*   国家统计局的数据有四个省份（中山市、东莞市、三沙市、儋州市）没有下级数据，目前解决方案是获取数据时直接插入遗漏的数据(./src/missing.json)。
*   已反馈国家统计局，答复为：“您好！来信收悉。根据国务院部门职能分工，民政部负责县以上行政区划有关工作。国家统计局使用民政部公布的县以上行政区划代码，根据统计工作的需要，每年在我局网站上公布相关内容并明确注明区划变更截止时点。经认真核对《国务院关于广东省调整部分行政区划的批复》（国函〔1988〕6号）、《民政部关于国务院批准设立地级三沙市的公告》、《国务院关于同意海南省调整儋州市行政区划的批复》（国函〔2015〕41号）等文件资料以及民政部网站，您来信提及的中山市、东莞市、三沙市和儋州市均无县级行政区划。因此，国家统计局网站也无相应信息。感谢您对统计标准工作的关注和支持！”  

### 文件列表（京东触屏数据源）
|文件名称|文件描述|文件大小|
|:------|:------|:-----|
| dist/jd_province_city.js | 包含“省份”“市级”数据 | 10 KB |
| dist/jd_province_city_id.js | 包含“省份”“市级”数据（含ID） | 15 KB |
| dist/jd_province_city_area.js | 包含“省份”“市级”“县级”数据 | 94 KB |
| dist/jd_province_city_area_id.js | 包含“省份”“市级”“县级”数据（含ID） | 149 KB |

### 文件列表（国家统计局数据源）
|文件名称|文件描述|文件大小|
|:------|:------|:-----|
| dist/gov_province_city.js | 包含“省份”“市级”数据 | 11 KB |
| dist/gov_province_city_id.js | 包含“省份”“市级”数据（含ID） | 15 KB |
| dist/gov_province_city_area.js | 包含“省份”“市级”“县级”数据 | 71 KB |
| dist/gov_province_city_area_id.js | 包含“省份”“市级”“县级”数据（含ID） | 115 KB |

### 安装
```html
$ npm install ydui-district --save

或: 

<script src="//unpkg.com/ydui-district/dist/gov_province_city_area_id.js"></script>
console.log(window.YDUI_DISTRICT);
```

### 使用
```html
import District from 'ydui-district/dist/gov_province_city_area_id';

或: 

var District = require('ydui-district/dist/gov_province_city_area_id');
```

### 生成最新数据文件
```shell
1. npm install

2. npm run build:jd （生成京东数据源文件）

3. npm run build:gov （生成国家统计局数据源文件）
```

### 文件内容数据格式
*   键值说明：v => value, n => name, c => children 
*   不含ID文件：即不包含【"v": "1"】 

```shell
var district = [
    {
        "v": "1",
        "n": "北京",
        "c": [
            {
                "v": "2816",
                "n": "密云区",
                "c": [
                    {"v": "6667", "n": "城区"},
                    {"v": "2862", "n": "城区以外"},
                    ......
                ]
            },
            {
                "v": "72",
                "n": "朝阳区",
                "c": [
                    {"v": "2819", "n": "三环到四环之间"},
                    {"v": "2839", "n": "四环到五环之间"},
                    {"v": "2840", "n": "五环到六环之间"},
                    ......
                ]
            },
            ......
        ]
    },
    {
        "v": "2",
        "n": "上海",
        "c": [
            {
                "v": "2817",
                "n": "静安区",
                "c": [
                    {"v": "51973", "n": "城区"},
                    .....
                ]
            },
            {
                "v": "2820",
                "n": "闸北区",
                "c": [
                    {"v": "51972", "n": "城区"},
                    ......
                ]
            },
            ......
        ]
    },
    .....
];

if (typeof define === "function") {
    define(district)
} else {
    window.YDUI_DISTRICT = district
}
```
