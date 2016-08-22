# wmOffline
waimai offline dev tool

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/wm-offline.svg?style=flat-square

[npm-url]: http://npmjs.org/package/wm-offline
[download-image]: https://img.shields.io/npm/dm/wm-offline.svg?style=flat-square
[download-url]: https://npmjs.org/package/wm-offline

##install
```
npm install -g wm-offline
```

##config
add offline-config.json to the root of your project
```
{
	"watch": "./examples",
	"deploy": [
		{
			"receiver": "http://cp01-shimiao01.epc.baidu.com:8797/receiver.php",
			"to": "/home/map/odp_cater/webroot/static/offline"
		}
	]
}
```

##usage
```
wm-offline watch
```
start the offline dev tool and watch the change of the configtion\'s watch folder

```
wm-offline open
```
open the GUI page


##receiver

php version
https://github.com/fex-team/fis-command-release/blob/master/tools/receiver.php

node version
https://github.com/fex-team/receiver


##tips

mac 下杀进程的方法

lsof -i tcp:8088

kill -9 进程id
