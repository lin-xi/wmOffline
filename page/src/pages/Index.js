import "./index.less"

import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import QRCode from 'qrcode.react';
import Client from '../components/client/client';


const styles = {
    chip: {
        margin: 10
    }
};

const IndexPage = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState(){
        return {
            pluginId: localStorage.getItem('pluginId') || '',
            pageName: localStorage.getItem('pageName') || '',
            title: localStorage.getItem('title') || '',
            url: localStorage.getItem('deployUrl') || ''
        };
    },

    componentDidMount() {
        var me = this;
        var group = this.getQueryString('group');
        var cli = this.client = new Client(group);
        cli.ready(function(){
            cli.onMessage('updateUrl', function(data){
                me.setState({
                    url: data.content.url
                });
            });
        });
    },

    componentDidUpdate() {
        this.client.reload(this.getDebugUrl());
    },

    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    },

    getDebugUrl(){
        var me = this;
        var url = 'bdwm://plugin?pluginId={pluginId}&pageName={pageName}&title={title}&scrollViewBounces=0&url={url}';
        return url.replace(/\{(.*?)\}/g, function(s0, s1){
            if(s1 == 'title' || s1 == 'url'){
                return encodeURIComponent(me.state[s1]);
            }
            return me.state[s1];
        })
    },

    render() {
        return (
            <div className="page">
                <AppBar title="NA离线开发工具" iconClassNameRight="muidocs-icon-navigation-expand-more"/>
                <h3>调试</h3>
                <div className="code">
                    <span className="left">
                        <TextField id="pluginId" onChange={this.handleChange} hintText="pluginId" floatingLabelText="pluginId" value={this.state.pluginId}/><br/>
                        <TextField id="pageName" onChange={this.handleChange} hintText="pageName" floatingLabelText="页面名称" value={this.state.pageName}/><br/>
                        <TextField id="title" onChange={this.handleChange} hintText="title" floatingLabelText="标题" value={this.state.title}/><br/>
                        <TextField id="url" onChange={this.handleChange} hintText="package url" floatingLabelText="包地址" value={this.state.url}/><br/>
                        <TextField id="pageData" onChange={this.handleChange} hintText="page data" floatingLabelText="pageData参数" value={this.state.pageData}/>
                    </span>
                    <span className="center">
                        <QRCode value={this.getDebugUrl()} size={256} level="M" bgColor="#fff"/>
                    </span>
                    <span className="right">
                        <div className="label">
                            {this.getDebugUrl()}
                        </div>
                    </span>
                </div>

                <h3>下载测试包</h3>
                <div className="code c1">
                    <span className="left">
                        <img src="http://172.17.138.208:8080/jenkins/job/WMapp/lastSuccessfulBuild/artifact/app/build/outputs/apk/image.png"/>
                        <RaisedButton label="android" primary={true}/>
                    </span>
                    <span className="right">
                        <img src="http://172.17.138.208:8080/jenkins/job/WMapp_iOS/395/artifact/image.png"/>
                        <RaisedButton label="ios" primary={true}/>
                    </span>
                </div>

                <h3>离线开发工具安装</h3>
                <div className="code c2">
                    <span className="left">
                        <br/>
                        <div className="label">
                            npm install wm-offline  -g
                        </div>
                    </span>
                    <span className="right">
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
        );
    },

    handleChange(e){
        localStorage.setItem(e.target.id, e.target.value);
        var s = {};
        s[e.target.id] = e.target.value;
        this.setState(s);
    }

});

export default IndexPage;
