webpackJsonp([6],{13:function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){var t="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103;return function(e,o,n,a){var i=e&&e.defaultProps,r=arguments.length-3;if(o||0===r||(o={}),o&&i)for(var s in i)void 0===o[s]&&(o[s]=i[s]);else o||(o=i||{});if(1===r)o.children=a;else if(r>1){for(var l=Array(r),c=0;c<r;c++)l[c]=arguments[c+3];o.children=l}return{$$typeof:t,type:e,key:void 0===n?null:""+n,ref:null,props:o,_owner:null}}}();o(17);var i=o(3),r=n(i),s=(o(5),o(8)),l=o(6),c=n(l),d=r.default.createClass({displayName:"Toast",mixins:[c.default],render:function(){return a("div",{className:"toast",style:{display:this.props.display?"block":"none"}},void 0,a("div",{className:"mask"},void 0,a("div",{className:"popUp"},void 0,this.props.text)))}}),u=function(t){return{text:t.Toast.text,display:t.Toast.display}},f=(0,s.connect)(u)(d);e.default=f;(function(){"undefined"!=typeof __REACT_HOT_LOADER__&&(__REACT_HOT_LOADER__.register(d,"Toast","/Users/wangcai/Work/waimai_4-0-1097-32_BRANCH/src/components/common/Toast/Toast.js"),__REACT_HOT_LOADER__.register(u,"mapStateToProps","/Users/wangcai/Work/waimai_4-0-1097-32_BRANCH/src/components/common/Toast/Toast.js"),__REACT_HOT_LOADER__.register(f,"default","/Users/wangcai/Work/waimai_4-0-1097-32_BRANCH/src/components/common/Toast/Toast.js"))})();t.exports=e.default},15:function(t,e,o){e=t.exports=o(1)(),e.push([t.id,".toast{position:fixed;left:0;right:0;bottom:0;top:0;z-index:99999}.toast,.toast .mask{width:100%;height:100%}.toast .mask{display:-webkit-box;display:flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center}.toast .mask .popUp{padding:.55rem 1.35rem;background-color:rgba(30,30,30,.8);color:#fff;font-size:14px;text-align:center;box-shadow:rgba(0,0,0,.4);border-radius:5px;max-width:15rem;word-break:break-all}",""])},17:function(t,e,o){var n=o(15);"string"==typeof n&&(n=[[t.id,n,""]]);o(2)(n,{});n.locals&&(t.exports=n.locals)},45:function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0}),e.getCollectList=void 0;var a=o(10),i=n(a),r=o(9),s=e.getCollectList=function(t){return(0,i.default)({url:r.GET_COLLECT_LIST,data:t})};(function(){"undefined"!=typeof __REACT_HOT_LOADER__&&__REACT_HOT_LOADER__.register(s,"getCollectList","/Users/wangcai/Work/waimai_4-0-1097-32_BRANCH/src/actions/CollectList.js")})()},64:function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){var t="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103;return function(e,o,n,a){var i=e&&e.defaultProps,r=arguments.length-3;if(o||0===r||(o={}),o&&i)for(var s in i)void 0===o[s]&&(o[s]=i[s]);else o||(o=i||{});if(1===r)o.children=a;else if(r>1){for(var l=Array(r),c=0;c<r;c++)l[c]=arguments[c+3];o.children=l}return{$$typeof:t,type:e,key:void 0===n?null:""+n,ref:null,props:o,_owner:null}}}();o(134);var i=o(3),r=n(i),s=o(8),l=o(6),c=n(l),d=o(27),u=n(d),f=o(22),_=n(f),p=o(45),m=o(5),g=o(4),h=o(7),v=n(h),b=o(13),y=n(b),w=a("img",{src:"http://img.waimai.baidu.com/pb/1447c50dd72bdcd7cdbffe75ea8627f652",alt:"",className:"no_collect_img"}),k=a("div",{className:"title"},void 0,"没有收藏的文章，快去指南看看吧~"),x=a(y.default,{}),T=r.default.createClass({displayName:"ColumnHome",mixins:[c.default],getInitialState:function(){return v.default.setTitleBar({title:"收藏夹"}),{current:1,rn:10,content_list:this.props.data.list||[],total:this.props.data.total,lazyLoad:this.props.data.list.length<this.props.data.total}},componentDidMount:function(){g._lazyLoad.add(),this.addObserver();var t=this.refs.container;t.style.height=window.innerHeight+"px"},addObserver:function(){var t=this;v.default.addObserver("chisha-content-status",function(e){for(var o=t.state.content_list.slice(0),n=0;n<o.length;n++)if(o[n].content_id==e.id){o[n]=(0,g._extend)(o[n],e.newStatus);break}t.setState({content_list:o})})},nextPage:function(){var t=this,e=this.props.dispatch;return e((0,p.getCollectList)({pn:this.state.current+1,rn:this.state.rn})).then(function(e){var o=!e.result.list.length||e.result.list.length+t.state.content_list.length>=e.result.total;t.setState({content_list:t.state.content_list.concat(e.result.list),current:t.state.current+1,total:e.result.total,lazyLoad:!o})})},getLazyLoad:function(){if(this.state.lazyLoad)return a(_.default,{loading:this.nextPage})},back:function(){v.default.closePage()},render:function(){return 0==this.state.total?r.default.createElement("div",{className:"no_collect",ref:"container"},a("div",{className:"container"},void 0,w,k,a("div",{className:"backButton",onClick:(0,m.wrapperClick)(this.back)},void 0,"返回指南"))):a("div",{className:"collect_list "+((0,g._isWMApp)()?"":"outApp")},void 0,r.default.createElement("div",{className:"content_container",ref:"container"},a("div",{className:"card_container"},void 0,this.state.content_list.map(function(t){return a(u.default,{data:t},t.content_id)})),this.getLazyLoad()),x)}}),C=(0,s.connect)()(T);e.default=C;(function(){"undefined"!=typeof __REACT_HOT_LOADER__&&(__REACT_HOT_LOADER__.register(T,"ColumnHome","/Users/wangcai/Work/waimai_4-0-1097-32_BRANCH/src/pages/CollectList/index.js"),__REACT_HOT_LOADER__.register(C,"default","/Users/wangcai/Work/waimai_4-0-1097-32_BRANCH/src/pages/CollectList/index.js"))})();t.exports=e.default},99:function(t,e,o){e=t.exports=o(1)(),e.push([t.id,".collect_list{width:100%;overflow-x:hidden;overflow-y:auto;-webkit-user-select:none;user-select:none;-webkit-overflow-scrolling:touch}.no_collect{width:100%;height:100%;display:-webkit-box;display:flex;-webkit-box-pack:center;justify-content:center;-webkit-box-align:center;align-items:center;margin-top:-3rem}.no_collect .container{width:100%}.no_collect .container .no_collect_img{display:block;height:auto;width:55%;margin:0 auto 1rem}.no_collect .container .title{font-size:1.6rem;color:#999;text-align:center;padding-bottom:2rem}.no_collect .container .backButton{background:#ff2d4b;font-size:1.6rem;width:12rem;height:4rem;color:#fff;line-height:4rem;text-align:center;margin:0 auto;border-radius:20px}",""])},134:function(t,e,o){var n=o(99);"string"==typeof n&&(n=[[t.id,n,""]]);o(2)(n,{});n.locals&&(t.exports=n.locals)}});