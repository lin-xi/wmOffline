webpackJsonp([15],{7:function(e,n,o){var i;i=function(){function e(){var e=null,n=null;return{then:function(o){e=o,n&&e.apply(null,n)},resolve:function(){n=arguments,e&&e.apply(null,n)}}}function n(){var e=new t.Deferred,n=Array.prototype.slice.call(arguments,0),o=[],i=0;return n.length>0&&n.forEach(function(t,a){t.then(function(t){i++,o[a]=t,i==n.length&&e.resolve.apply(null,o)})}),e}var i=o(5),t={_uid:0,getAjaxData:function(e,n,o,i){t.ajax.get(e,n,o,i)},postAjaxData:function(e,n,o,i,a){t.ajax.post(e,n,o,i,a)},jsonp:function(e,n,o,i){var a=document.getElementsByTagName("head")[0],r=document.createElement("script"),c="func_"+t.md5(),d=t.param(n);e+=1!=e.indexOf("?")?"&"+d+"&callback="+c:"?"+d+"&callback="+c,window[c]=function(e){o&&o(e)},r.src=e,r.onerror=function(){i&&i()},a.appendChild(r)},md5:function(e){for(var n=e||3,o=0,i="";o<n;o++)i+=Math.floor(65535*Math.random()).toString(32)+this.uuid();return i},uuid:function(){return++this._uid},ajax:function(){function e(e,n,o,i,a,r,c){var d=null;if(window.XMLHttpRequest?d=new XMLHttpRequest:window.ActiveXObject&&(d=new ActiveXObject("Microsoft.XMLHTTP")),null!=d){var s=e,p=t.param(o);p&&(s=e+"?"+p),d.timeout=1e4,d.open(n,s,!0),d.onreadystatechange=function(){if(4==d.readyState)if(200==d.status){var e=d.responseText;"json"==c?a&&a(JSON.parse(e)):a&&a(e)}else{var e=d.responseText;r&&r(e)}},d.onprogress=function(){},d.ontimeout=function(e){r&&r("请求超时")}}var l;if(i){var u=[];for(var w in i)u.push(w+"="+encodeURIComponent(i[w]));l=u.join("&"),l.length&&d.setRequestHeader("Content-type","application/x-www-form-urlencoded")}d.send(l)}return{get:function(n,o,i,t){e(n,"GET",o,null,i,t,"json")},post:function(n,o,i,t,a){e(n,"POST",o,i,t,a,"json")}}}(),param:function(e){var n=[];for(var o in e)n.push(o+"="+encodeURIComponent(e[o]));return n.join("&")},isWeixin:function(){return navigator.userAgent.indexOf("MicroMessenger")>-1},isIOS:function(){var e=navigator.userAgent.toLowerCase();return e.indexOf("iphone")!=-1||e.indexOf("ipad")!=-1||e.indexOf("ipod")!=-1},open:function(e){var n=location.href.replace(location.hash),o=n+e;try{if(window.WMApp){var i={pageName:"webview",pageParams:{url:encodeURIComponent(o),header:1}};window.WMApp.page.changePage(i)}else location.href=o}catch(t){location.href=o}},getParams:function(e){var n,o,i,t={};if(e=e||window.location.href,e.indexOf("?")==-1)return t;for(o=e.slice(e.indexOf("?")+1).split("&"),i=0;i<o.length;i++)o[i]&&o[i].indexOf("=")!=-1&&(n=o[i].split("="),n[1]&&(t[n[0]]=n[1].indexOf("#")!=-1?n[1].slice(0,n[1].indexOf("#")):n[1]));return t},translateCityCode:function(e,n){var o="/mobile/waimai?qt=convertcitycode&source=BNCode&display=json&sourceCode="+e;t.ajax.get(o,{},function(e){0==e.error_no&&n&&n(e.result)},function(){n&&n({cityCode:131})})},na:function(){return{setTitleBar:function(e,n,o){window.WMApp?(window.WMApp.page.setTitleBar({titleText:e,titleClickAble:0,actionText:n||"",actionClickAble:1}),o&&window.WMApp.entry.setPageAction("onActionClick",o)):window.BNJS&&window.BNJS.ui.title.setTitle(e)},checkVersion:function(e,n){function o(e){var n=e.split("."),o=n.length,i=0;return n.forEach(function(e,n){i+=e*Math.pow(10,2*(o-n))}),i}if(window.WMApp){var i=window.WMApp.device.getAppVersion();i&&(o(i)<o(e)?n&&n(!0):n&&n(!1))}else n&&n(!1)},selectAddress:function(e,n,o,i,t){var a=location.origin+"/mobile/waimai?qt=addresslist&id="+n+"&address_id="+n+"&shop_id="+e+"&urlfrom=orderconfirm&pinzhiPayV2=1&lat="+o+"&lng="+i;window.WMApp||(a+="&fromWeixin=1"),window.WMApp&&window.WMApp.address?location.href="bdwm://zaocan?url="+encodeURIComponent(a):location.href=a},addAddress:function(e,n,o,i){var t=location.origin+"/mobile/waimai?qt=addressadd&shop_id="+e+"&urlfrom=orderconfirm&pagelets[]=pager&pinzhiPayV2=1";window.WMApp||(t+="&fromWeixin=1"),window.WMApp&&window.WMApp.address?location.href="bdwm://zaocan?url="+encodeURIComponent(t):location.href=t},selectCoupon:function(e,n,o,i){if(window.WMApp&&window.WMApp.coupon){var t={shopId:e,totalOrderPrice:n+"",payPlat:o};WMApp.coupon.selectCoupon(t,function(e){e.status&&i&&i(e.result.couponId)})}else{var a=location.origin+"/mobile/waimai?qt=getvalidcoupon&shop_id="+this.props.params.shopId+"&order_price="+cartData.totalPrice+"&pay_plat="+o+"&pinzhiPayV2=1&t="+(new Date).getTime();location.href=a}},pay:function(e,n,o,i,t){if(window.WMApp&&window.WMApp.pay.doPay){var a={payType:n,payParams:o};window.WMApp.pay.doPay(a,function(e){e.status?i&&i():t&&t()})}else window.BNJS?(o=JSON.parse(o),o.onSuccess=function(){i&&i()},o.onCancel=function(){t&&t()},window.BNJS.page.startPay(o)):location.href=e},getLngLat:function(){return window.WMApp?{lng:window.WMApp.location.getLocLng(),lat:window.WMApp.location.getLocLat()}:window.BNJS?(window.BNJS.location.getLocation(),{lng:window.BNJS.location.longitude,lat:window.BNJS.location.latitude}):void 0},getLngLatAsync:function(e){if(window.WMApp){var n=function(n){o||(o=!0,e&&e(n))},o=!1;window.WMApp.location.getAsyncLocation(n),setTimeout(n,1e3)}else if(window.BNJS){var t=function(n){o||(o=!0,n&&0==n.errno?e&&e({lng:n.data.longitude,lat:n.data.latitude,cityId:i.getData("pinzhicurcityid"),address:n.data.address}):e&&e({lat:"",lng:"",cityId:131,address:""}))},o=!1;window.BNJS.location.requestRealTimeLocation(t),setTimeout(t,2e3)}else e&&e({lat:"",lng:"",cityId:131,address:""})},getAntiCheating:function(e){if(window.WMApp){var n=function(n){o||(o=!0,e&&e(n))},o=!1;window.WMApp.device.getAntiCheating(n),setTimeout(n,1e3)}else if(window.BNJS){var i=function(n){o||(o=!0,0==n.errno?"ios"==window.BNJS.device.platform?e&&e({result:{cheatInfo:""}}):e&&e({result:{cheatInfo:n.data.accode}}):e&&e({result:{cheatInfo:""}}))},o=!1;window.BNJS.env.acCode("waimai",i)}else e&&e({result:{cheatInfo:""}})},getFrom:function(e){return window.WMApp?window.WMApp.device.getFrom():window.BNJS?"ios"==window.BNJS.device.platform?"bn-ios":"bn-android":"webapp"},getClient:function(e){if(!window.BNJS)return"";var n="-android";switch("ios"==window.BNJS.device.platform&&(n="-iphone"),BNJS.env.packageName){case"com.renren-inc.nuomi":return"nuomi"+n;case"com.baidu.wallet":return"qianbao"+n;case"com.baidu.map":return"map"+n;case"com.baidu.secretary":return"dumi"+n;case"com.baidu":return"kuang"+n;default:return"nuomi"+n}},changePage:function(e){if(window.WMApp){var n={pageName:"webview",pageParams:{url:encodeURIComponent(e),header:1}};window.WMApp.page.changePage(n)}else if(window.BNJS){var o="bainuo://component?url="+encodeURIComponent(e);window.BNJS.page.start(o,{},0,"rtl")}else location.href=e},getVersion:function(e){return window.WMApp?window.WMApp.device.getAppVersion():"3.7.1"},getDeviceInfo:function(){return window.WMApp?window.WMApp.device.getDevice():window.BNJS?{from:"webapp",cuid:window.BNJS.env.cuid,os:window.BNJS.device.os,sv:"3.7.1",model:window.BNJS.device.name,screen:window.BNJS.device.screenWidth+"*"+window.BNJS.device.screenHeight,channel:window.BNJS.env.appChannel,loc_lat:window.BNJS.location.latitude,loc_lng:window.BNJS.location.longitude,city_id:window.BNJS.location.cityCode,address:window.BNJS.location.address}:{from:"webapp",cuid:"",os:"",sv:"",model:"",screen:"",channel:"",loc_lat:"",loc_lng:"",city_id:"",address:""}},ready:function(e,n){var o=!1;window.WMApp?(o=!0,e&&e()):window.BNJS&&window.BNJS._isAllReady?(o=!0,e&&e()):(document.addEventListener("WMAppReady",function(){o||(o=!0,e&&e())}),document.addEventListener("BNJSReady",function(){o||(o=!0,e&&e())}),setTimeout(function(){o||window.BNJS||(o=!0,e&&e())},1500))},login:function(e,n){if(window.WMApp)window.WMApp.account.login(function(n){n.status&&e&&e()});else if(window.BNJS)window.BNJS.account.login({onSuccess:function(){e&&e()},onFail:function(e){alert("登陆失败！")}});else{var o=n||location.href;location.href="http://wappass.baidu.com/passport/?authsite=1&sms=1&u="+encodeURIComponent(o)}},bindPhone:function(){location.href="http://wappass.baidu.com/wp/bindwidget-bindmobile?bindToSmsLogin=1&u="+encodeURIComponent(location.href)},close:function(){window.WMApp?window.WMApp.page.closePage():window.BNJS?window.BNJS.page.back():history.back()}}}(),sak:function(e,n){var o=new Image,a=!0,r={resid:31,func:"place",da_ver:"2.1.0",da_trd:"xinpin_pinzhi",page:e.page||"PinZhiCollect",da_src:e.da_src||"PinZhiCollectPg",da_act:e.da_act||"collect",from:"webapp",xid1:t.filterFrom(e.xid1)||"",xid2:e.xid2||"",xid3:e.xid3||"",xid4:e.xid4||"",xid5:e.xid5||"",city_id:i.getData("pinzhicurcityid"),t:Date.now()},c="http://log.waimai.baidu.com/static/transparent.gif?"+t.param(r);o.onload=function(){o=null,a&&n&&(a=!1,n())},n&&setTimeout(function(){a&&(a=!1,n())},300),o.src=c},filterFrom:function(e){var n=["bdjg","nabanner","weixin","nuomi","nmbanner","ditu","shoubai","qianbao","sms","smzdm","wuliao","startScreen","toutiao","hongbao","apppush","dtentry","other"],o=n.indexOf(e);return o==-1&&(o=n.length-1),n[o]},sakOrderId:function(e,n,o,i,a,r){t.sak({xid1:t.filterFrom(e),xid2:n,xid3:i,xid4:o,xid5:a},r)}};return t.Deferred=e,t.when=n,t}.call(n,o,n,e),!(void 0!==i&&(e.exports=i))},51:function(e,n,o){var i,t=function(){var e="function"==typeof Symbol&&Symbol["for"]&&Symbol["for"]("react.element")||60103;return function(n,o,i,t){var a=n&&n.defaultProps,r=arguments.length-3;if(o||0===r||(o={}),o&&a)for(var c in a)void 0===o[c]&&(o[c]=a[c]);else o||(o=a||{});if(1===r)o.children=t;else if(r>1){for(var d=Array(r),s=0;s<r;s++)d[s]=arguments[s+3];o.children=d}return{$$typeof:e,type:n,key:void 0===i?null:""+i,ref:null,props:o,_owner:null}}}();o(59);var a=o(71),r=t("a",{className:"hongbao",href:"/static/zhuanti/europeancup/?topics=1465960468634751108,1465960514634751541,1465960564634752184,1465960601634752457"}),c=t("img",{src:a}),d=t("p",{},void 0,t("b",{},void 0,"成功提交订单")),s=t("p",{},void 0,"我们会尽快处理您的订单"),p=t("p",{},void 0,"订单信息在首页-订单页面查询");i=function(){var e=o(7),n=React.createClass({displayName:"PaySuccess",getInitialState:function(){return{show:this.props.show}},componentWillReceiveProps:function(e){this.state.show=e.show,this.setState(this.state)},render:function(){return t("div",{id:"page-ordersuccess",style:{display:this.props.show?"block":"none"}},void 0,r,t("div",{className:"content"},void 0,c,d,s,p,t("a",{onTouchStart:this.back},void 0,"返回商品页")))},back:function(){if(e.isWeixin()){var n=LocalStorage.getData("COM_itemId");n?location.href=location.href.replace(location.hash,"")+"#/detail/"+n:location.href=location.href.replace(location.hash,"")+"#/"}else window.WMApp?window.WMApp.page.closePage():window.BNJS?window.BNJS.page.back():location.href="bdwm://zaocan?action=index"}});return n}.call(n,o,n,e),!(void 0!==i&&(e.exports=i))},59:function(e,n,o){n=e.exports=o(2)(),n.push([e.id,"#page-ordersuccess{position:fixed;width:100%;height:100%;left:0;top:0;z-index:100}#page-ordersuccess .hongbao{position:fixed;left:50%;bottom:3.5rem;width:19rem;height:12rem;margin-left:-9.5rem;background:url("+o(72)+") no-repeat;background-size:100%;z-index:200;animation:scale 1.1s linear 0s infinite;-webkit-animation:scale 1.1s linear 0s infinite}@-webkit-keyframes scale{0%{-webkit-transform:scale(1,1);transform:scale(1,1)}25%{-webkit-transform:scale(1.05,1.05);transform:scale(1.05,1.05)}50%{-webkit-transform:scale(1,1);transform:scale(1,1)}75%{-webkit-transform:scale(.95,.95);transform:scale(.95,.95)}}@keyframes scale{0%,to{-webkit-transform:scale(1,1);transform:scale(1,1)}25%{-webkit-transform:scale(1.05,1.05);transform:scale(1.05,1.05)}50%{-webkit-transform:scale(1,1);transform:scale(1,1)}75%{-webkit-transform:scale(.95,.95);transform:scale(.95,.95)}to{-webkit-transform:scale(1,1);transform:scale(1,1)}}#page-ordersuccess .content{height:100%;width:100%;text-align:center;background:#ebedf0;padding-top:25%}#page-ordersuccess .content img{width:10rem;height:10rem;margin-bottom:1rem}#page-ordersuccess .content p{margin-top:1rem;margin-bottom:1.5rem;color:#4a4a4a;font-size:1.4rem}#page-ordersuccess .content p b{font-weight:700}#page-ordersuccess .content a{display:inline-block;background:#fe2947;padding:1rem 2rem;border-radius:2rem 2rem 2rem 2rem;color:#fff;font-size:1.4rem;margin-top:3rem}",""])},71:function(e,n,o){e.exports=o.p+"images/done.2da2b788.png"},72:function(e,n,o){e.exports=o.p+"images/hongbao.79d5c94e.png"}});