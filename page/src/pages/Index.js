import "./index.less"

import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import FlatButton from 'material-ui/FlatButton'
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import QRCode from 'qrcode.react';
import Client from '../components/client/client';
import {findIndex} from 'lodash'

const ios = require('../assets/images/ios.png');
const android = require('../assets/images/android.png');
const banff_ios = require('../assets/images/banff-ios.png');

const styles = {
    chip: {
        margin: 10
    },
    radioButton: {
        display: "inline-block",
        width: '50%'
    }
};

const IndexPage = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState(){
        return {
            platform: localStorage.getItem('platform') || 'waimai',
            pluginId: localStorage.getItem('pluginId') || '',
            pageName: localStorage.getItem('pageName') || '',
            title: localStorage.getItem('title') || '',
            url: localStorage.getItem('deployUrl') || '',
            pageData: localStorage.getItem('pageData') || '',
            consoleList: []
        };
    },

    componentDidMount() {
        var me = this;
        me.sak({
            daSrc: 'wmOfflinePg.pagePV',
            daAct: 'show'
        });
        var group = this.getQueryString('group');
        var cli = this.client = new Client(group);
        cli.ready(function () {
            cli.getUrl(function (data) {
                me.setState({
                    url: data.content
                });
            });

            cli.onMessage('updateUrl', function (data) {
                me.setState({
                    url: data.content.url
                });
            });

            cli.onMessage('console', function (data) {
                var content = typeof data.content == 'object' ? JSON.stringify(data.content) : data.content;
                me.setState({
                    consoleList: me.state.consoleList.concat(content)
                });
            });

        });
    },

    componentDidUpdate(prevProps, prevState){
        this.sak({
            daSrc: 'wmOfflinePg.render',
            daAct: 'click'
        });
        if (prevProps.url != this.props.url || prevState.url != this.state.url) {
            this.client.reload(this.getDebugUrl());
        }
    }
    ,

    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    ,

    getDebugUrl() {
        this.sak({
            daSrc: 'wmOfflinePg.debugUrl',
            daAct: 'click'
        });
        var me = this;
        var protocol = 'bdwm://';
        if (me.state.platform == 'banff') {
            protocol = 'banff://';
        }
        var url = protocol + 'plugin?pluginId={pluginId}&pageName={pageName}&title={title}&scrollViewBounces=0';
        url = url.replace(/\{(.*?)\}/g, function (s0, s1) {
            if (s1 == 'title' || s1 == 'url') {
                return encodeURIComponent(me.state[s1]);
            }
            return me.state[s1];
        });
        if (me.state.url) {
            if (me.state.platform == 'banff') {
                url += '&url=' + encodeURIComponent(me.state.url);
            } else {
                url += '&downloadUrl=' + encodeURIComponent(me.state.url);
            }
        }
        if (me.state.pageData) {
            url += '&pageData=' + encodeURIComponent(me.state.pageData);
        }
        return url;
    },
    resetConsole(){
        this.setState({
            consoleList: []
        });
    },

    render()
    {
        return (
            <div className="page">
                <div className="play-ground">
                    <canvas></canvas>
                </div>
                <AppBar title="NA离线开发工具" iconClassNameRight="muidocs-icon-navigation-expand-more"/>
                <Tabs>
                    <Tab label="调试" value="1">
                        <div className="body">
                            <div className="code">
                        <span className="left-3">
                            <RadioButtonGroup id="platform" defaultSelected={this.state.platform}
                                              onChange={this.radioChange}>
                                <RadioButton value="waimai" label="百度外卖" style={styles.radioButton}/>
                                <RadioButton value="banff" label="banff" style={styles.radioButton}/>
                            </RadioButtonGroup>
                            <TextField id="pluginId" onChange={this.handleChange} hintText="pluginId"
                                       floatingLabelText="pluginId" value={this.state.pluginId}/><br/>
                            <TextField id="pageName" onChange={this.handleChange} hintText="pageName"
                                       floatingLabelText="页面名称" value={this.state.pageName}/><br/>
                            <TextField id="title" onChange={this.handleChange} hintText="title" floatingLabelText="标题"
                                       value={this.state.title}/><br/>
                            <TextField id="url" onChange={this.handleChange} hintText="package url"
                                       floatingLabelText="包地址" value={this.state.url}/><br/>
                            <TextField id="pageData" onChange={this.handleChange} hintText="page data"
                                       floatingLabelText="pageData参数(不需要encode)" value={this.state.pageData}/><br/>
                            <div className="hint">如果是json，注意key加引号</div>
                        </span>
                        <span className="center-3">
                            <QRCode value={this.getDebugUrl()} size={256} level="M" bgColor="#fff"/>
                        </span>
                        <span className="right-3">
                            <div className="label">
                                {this.getDebugUrl()}
                            </div>
                        </span>
                            </div>

                            <h3>下载测试包</h3>
                            <div className="code c1">
                        <span className="left-4">
                            <RaisedButton label="百度外卖android" primary={true}/><br/>
                            <img src={ios}/>
                        </span>
                        <span className="left-4">
                            <RaisedButton label="百度外卖ios" primary={true}/><br/>
                            <img src={android}/>
                        </span>
                        <span className="left-4">
                            <RaisedButton label="banff android" primary={true}/><br/>
                            <img src=""/>
                        </span>
                        <span className="left-4">
                            <RaisedButton label="banff ios" primary={true}/><br/>
                            <img src={ios}/>
                        </span>
                            </div>

                            <h3>离线开发工具安装</h3>
                            <div className="code c2">
                        <span className="left-2">
                            <br/>
                            <div className="label">
                                npm install wm-offline  -g
                            </div>
                        </span>
                        <span className="right-2">
                            <h3>用法</h3>
                            <div className="label">
                                //监听模式<br/>
                                wm-offline watch
                            </div>
                            <br/><br/>
                            <div className="label">
                                //打开页面<br/>
                                wm-offline open
                            </div>
                            <h3>wmOffline配置</h3>
                            <div className="label pre">
                                <p>{"{"}</p>
                                    <p className="l1">pluginId: "bdwm.plugin.pinzhi",</p>
                                    <p className="l1">watch: "./build",</p>
                                    <p className="l1">{"deploy: {"}</p>
                                        <p className="l2">receiver: "http://d.baidu.com:8797/receiver.php",</p>
                                        <p className="l2">to: "/home/map/odp_cater/webroot/static/offline",</p>
                                        <p className="l1">{"}"}</p>
                                    <p>{"}"}</p>
                            </div>
                        </span>
                            </div>
                        </div>
                    </Tab>
                    <Tab label="控制台" value="2">
                        <div className="console_container">
                            <FlatButton label="清空" onClick={this.resetConsole} primary={true} className="clear"/>
                            <ul className="console_list">
                                {this.state.consoleList.map(function (console) {
                                    return <li className="console_item"><div>{console}</div></li>
                                })}
                            </ul>
                        </div>
                    </Tab>
                </Tabs>

            </div>
        );
    }
    ,

    handleChange(e)
    {
        localStorage.setItem(e.target.id, e.target.value);
        var s = {};
        s[e.target.id] = e.target.value;
        this.setState(s);
    }
    ,

    radioChange(e, val)
    {
        this.sak({
            daSrc: 'wmOfflinePg.plat_' + val,
            daAct: 'click'
        });
        localStorage.setItem('platform', val);
        this.setState({
            'platform': val
        });
    }
    ,

    sak(data)
    {
        var img = new Image();
        var params = {
            resid: 31,   //webapp
            func: "place",
            da_ver: "2.1.0",
            da_trd: 'wm-offline',
            page: 'wm-offline',
            da_src: data.daSrc,
            da_act: data.daAct,
            from: 'webapp',  //webapp,na-iphone na-android, nuomi-iphone, nuomi-android
            t: Date.now()
        };
        var url = 'http://log.waimai.baidu.com/static/transparent.gif?' + this.param(params);
        img.onload = function () {
            img = null;
        };
        img.src = url;
    }
    ,

    param(obj)
    {
        var temp = [];
        for (var key in obj) {
            temp.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return temp.join('&');
    }

});

export default IndexPage;
