# wmOffline
waimai offline dev tool

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/wm-offline.svg?style=flat-square

[npm-url]: http://npmjs.org/package/wm-offline
[download-image]: https://img.shields.io/npm/dm/wm-offline.svg?style=flat-square
[download-url]: https://npmjs.org/package/wm-offline

## install
```
npm install -g wm-offline
```

## config
add offline-config.json to the root of your project
```
{
	"watch": "./examples",
	"pluginId": "bdwm.plugin.pinzhi",
	"deploy": [
		{
			"receiver": "http://gzhxy-waimai-dcloud25.gzhxy.iwm.name:8325/receiver.php",
			"to": "/home/map/odp_cater/webroot/static/offline",
			"publicPort": 8109
		}
	]
}
```

## usage

wm-offline watch
```
start the offline dev tool and watch the change of the configtion\'s watch folder
```

wm-offline build
```
build the release package, resovle '<script id="wmapp"></script>' to real path.
put the tag '<script id="wmapp"></script>' in the head front of any other js, to accelerate the NA to ready,
in fact, the NA is ready anywhere in other js.
```

提前注入bridge

+ 在header中添加标签 ```<script id="wmapp"></script>```
+ wm-offline build

## receiver

php version
https://github.com/fex-team/fis-command-release/blob/master/tools/receiver.php

node version
https://github.com/fex-team/receiver


## release log

+ 1.1.51
```
   1. 修复react版本冲突bug
   2. 添加日志调试console.log功能
```

+ 1.1.47
```
   1. 添加wm-offline build, build打的包不会注入socket，然后会解析<script id="wmapp"></script>
   2. 离线协议修改，url -> downloadUrl
   3. 添加统计
```

## tips

mac 下杀进程的方法

lsof -i tcp:8088

kill -9 进程id
