/**
 * CopyrightMark - a website content copyright plugin
 * version 1.0.0
 * Copyright (c) 2019-2020, Ye Kangfu (https://github.com/fuload).
 * https://www.fuload.cn/copyrightmark
 * 
 * Author: Ye Kangfu (fuload) 
 * Email: 373539902@qq.com 
 * Website: https://fuload.cn
 * 
 * Licensed under the MIT license. 
 * http://www.opensource.org/licenses/mit-license.php
 */
;(function(factory){
    'use strict';
	factory();
})(function(){
    'use strict';

    var 
    config,

    /**
     * ----------------------------------------简易jQuery模式-------------------------------------
     */
    $ = function(selector){
        var querySelectorAll = function(element, selector){
            return element ? element.querySelectorAll(selector) : null;
        },
        // 检查匹配的元素。
        matches = function(element, elements){
            if(elements && elements.length > 0){
                for(var i=0; i < elements.length; i++){
                    if(elements[i] === element)
                        return true;
                }
            }
            return false;
        },
        o, 
        element, 
        elements = [];
        if(selector && typeof selector == 'object'){ // 目标对象的
            elements[0] = selector;
        }else if(selector == 'body'){ // body的
            elements[0] = document.body;
        }else if(/^\#[a-zA-Z0-9\-\_]+/.test(selector)){ // ID的
            elements[0] = document.getElementById(selector.substr(1));
        }else if(/^[a-zA-Z]{1,10}[1-6]?$/.test(selector)){ // 标签名的
            elements = document.getElementsByTagName(selector);
        }else if(/^\<[a-zA-Z]{1,10}[1-6]?\/?\>/i.test(selector)){ // html代码的
            var sele = selector.match(/^\<([a-zA-Z]{1,10}[1-6]?)\/\>$|([^\0]+)/i);
            var d = document.createElement(sele[1]||'div');
            if(sele[2]){
                d.innerHTML = sele[2];
                d = d.firstChild;
            }
            elements[0] = d;
        }else{ // 多个选择器的
            elements = querySelectorAll(document, selector);
        }

        o = {
            eq: function(i){
                element = elements[i|0];
                return this;
            },
            find: function(selector){
                elements = querySelectorAll(elements[0], selector);
                return this;
            },
            on: function(type, func){
                element = element || elements[0];
                var i, types = type.split(' ');
                for(i in types){
                    if(types[i]){
                        var tm = types[i].split('.');
                        if(element.addEventListener){
                            element.addEventListener(tm[0], function(e){func(e);}, false);
                        }else{//ie8
                            element.attachEvent('on'+tm[0], function(e){func(e);}, false);
                        }
                    }
                }
                return this;
            },
            attr: function(name, value){
                element = element || elements[0];
                if(value){
                    return this;
                }else{
                    return element ? element.getAttribute(name) : undefined;
                }
            },
            css: function(name, value){
                var csstext = name +':'+ value +';';
                element = element || elements[0];
                element.style.cssText = csstext;
                return this;
            },
            append: function(content){
                element = element || elements[0];
                var node = document.createElement('div');
                node.innerHTML = content;
                var nodes = node.childNodes;
                for(var i = 0; i <= nodes.length; i++){
                    element.appendChild(nodes[0]);
                }
                return this;
            },
            parents: function(expr){
                if(expr){
                    if(elements[0]){
                        var
                        _element = elements[0],
                        _elements = querySelectorAll(_element.parentNode, expr),
                        checkMatches = matches(_element, _elements);
                        //没有检索到匹配元素就继续循环检索。
                        while(_element && _element.nodeName!='BODY' && !checkMatches){
                            _element = _element.parentNode;
                            _elements = querySelectorAll(_element.parentNode, expr);
                            checkMatches = matches(_element, _elements);
                        }
                        elements[0] = _elements.length > 0 && checkMatches ? _element : null;
                    }
                }else{
                    elements[0] = element.parentNode;
                }
                return this;
            },
            is: function(expr){
                element = element || elements[0];
                if(element){
                    if(typeof expr === 'function'){
                        var obj = element;
                        obj.expr = expr;
                        obj.expr();
                    }else{
                        var _elements = querySelectorAll(element.parentNode, expr);
                        return _elements && matches(element, _elements) ? true : false;
                    }
                }else{
                    return false;
                }
            },
            html: function(){
                element = element || elements[0];
                return element ? element.innerHTML : '';
            },
            outerHtml: function(){
                element = element || elements[0];
                return element ? element.outerHTML : '';
            },
            text: function(){
                element = element || elements[0];
                return element ? element.textContent || element.innerText : '';
            },
            val: function(){
                element = element || elements[0];
                return element ? element.value : '';
            },
            remove: function(sele){
                if(element){
                    if(!sele){
                        element.parentNode.removeChild(element);
                    }
                }else if(elements){
                    var i = 0, eleng = elements.length;
                    for(; i<eleng; i++){
                        if(!sele){
                            elements[i].parentNode.removeChild(elements[i]);
                        }
                    }
                }
            },
            // 取出所有元素用于解决单程不能取出元素来作备用的问题。
            elems: function(i){
                return i>=0 ? elements[i|0] : elements;
            }
        };
        return o;
    },
    //----------------------------------------------------------------------------------------------

    getOuterHTML = function(target){
        return target.outerHtml();
    },
    
    parentElems = function(target, selector, i){
        return $(target).parents(selector).elems(i);
    },
    
    findElems = function(target, selector, i){
        return $(target).find(selector).elems(i);
    },

    /**
     * 默认参数
     */
    defaultParams = {
        // 设置版权标记内容的模板。
        template: {
            label: 'p',
            attrs: {
        
            },
            content: {
                notice: {
                    setHtml: '<span>This article copyright belongs to the original author all, reproduced please indicate the source.</span><br>'
                },
                source: {
                    getNode: {
                        main: 'head',
                        name: 'meta[property="og:site_name"]'
                    }
                },
                author: {
                    getNode: {
                        main:'head', 
                        name:'meta[name="author"]'
                    },
                    setHtml: '<span>Author: {author} {if source}(From {source}){/if}</span><br>'
                },
                link: {
                    setHtml: '<span>Web link: <a href="{url}">{url}</a></span><br>'
                }
            }
        },

        // 设置内容与插入的版权标记内容的分隔符。建议设br、hr、p。可以逗号分隔设置多个，如：br,hr,br
        separator: 'br', 

        // 设置把版权标记内容插入到文章的顶部。
        topInsert: false,

        // 设置恢复选取范围偏离多少个文字（仅限于IE8）。
        rangeDeviate: false,

        // 设置在哪些标签元素内启用版权标记功能。
        selector: 'body',

        // 设置删除复制内容中的某些标签元素。
        removeNode: null, 

        // 设置删除复制内容标签中的某些属性。
        removeAttr: null, 

        // 设置识别版权标记信息。
        discern: true,

        // 设置允许最小多少个文字才插入版权标记信息。
        minCopy: 100,

        // 设置复制屏障。
        barrier: false,

        // 设置复制屏障的对话框风格。
        barrierStyle: 'position:absolute;left:auto;top:auto;background:#000c;padding:5px 8px;color:#fff;',

        // 分派配置。
        assign: [], 

        // 设置允许作者设置参数。作者只可设置min（minCopy）、bar（barrier）、版权声明内容（参数名以1-10个字母任意命名）这三个参数。
        allowAuthorSet: false,

        // 设置在文章中显示版权标记内容（载入页面时立即嵌入到文章的顶部或底部）。
        showInArticle: false
    },

    /**
     * 判断是否对象
     */
    isObject = function(obj){
        return obj!==null && typeof obj === 'object' && !(obj instanceof Array);
    },

    /**
     * 判断是否数组
     */
    isArray = function(obj){
        return obj instanceof Array;
    },

    /**
     * 判断是否字符串
     */
    isString = function(str){
        return typeof str === 'string';
    },

    /**
     * 把被选对象转为文本字符
     */
    toString = function(sc){
        return sc.toString ? sc.toString() : sc+'';
    },

    /**
     * 合并对象
     */
    extend = function(o1, o2){
        var obj = o1, k;
        for(k in o2){
            if(isObject(o2[k]) && isObject(obj[k])){
                obj[k] = extend(obj[k], o2[k]);
            }else
                obj[k] = o2[k];
        }
        return obj;
    },

    /**
     * 替换回车符和换行符为其中一个。IE用到。
     */
    rnReplace = function(text){
        return text.replace(/\r\n+/g, '\r');
    },

    /**
     * 选中节点中的内容。
     */
    selectTempNode = function(e, sac){
        var range, temphtml, iframe, iframedoc;
        if(window.clipboardData){
            temphtml = tempContainer.innerHTML;
            tempContainer.innerHTML = '<iframe allowtransparency="true" src="about:blank"></iframe>';
            iframe = tempContainer.firstChild;
            iframedoc = iframe.contentWindow.document;
            iframedoc.write('<html><head><meta charset="UTF-8"></head><body></body></html>');
            iframedoc.body.innerHTML = temphtml;
            if(e.preventDefault){
                if(sac)
                    selection.removeAllRanges();
                e.preventDefault();
                range = iframedoc.createRange();
                range.selectNodeContents(iframedoc.body);
                iframe.contentWindow.getSelection().addRange(range);
            }else{//IE8
                e.returnValue = false;
                range = iframedoc.body.createTextRange();
                range.select();
            }
            document.execCommand('copy');
        }else{
            if(sac){
                selection.selectAllChildren(tempContainer);
            }else{
                range = document.createRange();
                range.selectNodeContents(tempContainer);
                selection.addRange(range);
            }
        }
    },

    /**
     * 检查网址。把没有协议的地址补全。
     */
    checkUrl = function(url){
        if(url){
            var pageurl = location.protocol +'//'+ location.host,
                _url = url.match(/^(\.[\.\/]{1,})(.*)/);
            if(_url){
                var i = 0,
                    ups = _url[1].split('/'),
                    pagepath = location.pathname,
                    paths = pagepath.split('/');
                paths.splice(0, 1);
                paths.splice(-1, 1);
                for(; i<ups.length; i++){
                    if(ups[i]=='..'){
                        paths.splice(-1, 1);
                    }
                }
                for(var j in paths){
                    pageurl += '/'+paths[j];
                }
                url = pageurl +'/'+ _url[2];
            }else{
                if(!/^(https?:\/\/|\/\/)/i.test(url)){
                    var oblique = /^\//.test(url) ? '' : '/';
                    url = pageurl + oblique + url;
                }
            }
        }
        return url;
    },

    /**
     * 获得已选择的区域（拖蓝区域）
     */
    getSelection = function(){
        if(window.getSelection){
            selection = window.getSelection();
        }else if(document.getSelection){
            selection = document.getSelection();
        }else if(document.selection){
            selection = document.selection.createRange();
        }
    },

    /**
     * 开启复制屏障功能时，弹出的消息对话框
     */
    barrierMessage = function(content, barrierStyle){
        var left, top;
        if(startX < endX){
            left = startX;
            top = startY;
        }else{
            left = endX;
            top = endY;
        }
        barrierStyle = barrierStyle.replace(/(left|top)\:\s*auto/ig, function(str, str1){
            switch (str1) {
                case 'left':
                    str = 'left:'+left+'px';
                    break;
                case 'top':
                    str = 'top:'+top+'px';
                    break;
            }
            return str;
        });
        $('body').append('<div id="'+name+'-barrier-dialog" style="'+barrierStyle+'">'+content+'</div>');
    },

    /**
     * 给元素添加属性。ejectid为排除ID
     */
    setAttrs = function(elem, attrs, ejectid){
        if(isObject(attrs)){
            for(var k in attrs){
                if(ejectid && k=='id'){
                    continue;
                }else{
                    var atr = document.createAttribute(k);
                    atr.nodeValue = attrs[k];
                    elem.setAttributeNode(atr);
                }
            }
        }
    },

    /**
     * 取得节点标签并组成代码
     * return object
     */
    getNodeLabel = function(obj, container){
        var label = '', 
        label_name = '', 
        label_url = '', 
        label_title = '', 
        getNode;
        if(obj.getNode){
            getNode = isString(obj.getNode) ? {main:obj.getNode} : obj.getNode;
            var hasLabel = false, 
            is_main_node = false;
            if(getNode.main){
                if(!$(container).find(getNode.main).is(getNode.main)){
                    if($(getNode.main).is(getNode.main)){// 子范围都找不到时再把Label以主范围来找
                        is_main_node = true;
                        hasLabel = true;
                    }
                }else{
                    hasLabel = true;
                }
            }
            if(hasLabel){
                // 存在主容器元素时找出名称和链接组成代码
                var 
                name_node = getNode.name ? is_main_node ? $(getNode.main).find(getNode.name) : $(container).find(getNode.main).find(getNode.name) : $(container).find(getNode.main),
                url_node = getNode.url ? is_main_node ? $(getNode.main).find(getNode.url) : $(container).find(getNode.main).find(getNode.url) : null,
                getTitle = function(){
                    var title = name_node.attr('title'); // 在名称节点找不到标题名时再从链接节点找出标题名
                    if(!title && url_node!==null){
                        title = url_node.attr('title');
                        if(!title && url_node.is('a'))
                            title = url_node.find('img').attr('title') || url_node.find('img').attr('alt') || ''; // 从链接都找不到标题名时再通过链接节点里的图片节点找出标题名（考虑到A节点下可能还有IMG节点）。
                    }
                    return title || '';
                },
                getContent = function(node, url){
                    var content;
                    if(node.is('input')){
                        content = node.val();
                    }else if(node.is('meta')){
                        content = node.attr('content');
                    }else{
                        content = url ? node.attr('href') : node.text();
                    }
                    return content;
                };
                if(!url_node && name_node.is('a')){
                    // 在不指定URL节点的情况下，如果名称节点为A元素时那么直接以名称节点为链接节点，让其可以取出链接地址。
                    url_node = name_node;
                }
                // 名称文字
                label_name = getContent(name_node);
                // 链接地址
                label_url = url_node ? getContent(url_node, 1) : '';
                if(label_name && label_name.replace(/[\n\r\f\t\v\s]+/gm, '')){ // 去掉空格和回车还存在内容时直接取出名称和标题名
                    label_name = label_name.replace(/[\n\r\f\t\v]+|^\s+|\s+$/gm, ''); //去掉回车换行符和前后空格
                    label_title = getTitle();
                }else{
                    // 当名称为空时直接通过标题名（title或alt）来作名称。
                    label_name = getTitle();
                    label_title = label_name;
                }
                if(label_name){
                    // 当名称存在时组成代码
                    if(obj.replace){
                        // 当有设了替换时把名称更改成指定的名称。
                        if(isArray(obj.replace)){
                            var ors = obj.replace;
                            if(ors.length > 1){
                                var sos = ors[0];
                                var res = ors[1];
                                var way = ors[2];
                                var sostr = isArray(sos) ? sos.join('|') : sos;
                                label_name = label_name.replace(new RegExp(sostr, 'ig'), function(str){
                                    var i = isArray(sos) ? sos.indexOf(str) : 0, ret = isArray(res) ? res[i] : res;
                                    if(way){
                                        if(way == '<')
                                            ret = ret + label_name;//从查找到的字符向前插入所设的字符
                                        if(way == '>')
                                            ret = label_name + ret;//从查找到的字符向后插入所设的字符
                                    }
                                    return ret;
                                });
                            }
                        }else if(isString(obj.replace)){
                            label_name = obj.replace;
                        }
                    }
                    label_url = checkUrl(label_url);
                    label = label_url ? '<a href="'+ label_url +'"'+ (label_title ? ' title="'+label_title+'"' : '') +'>'+ label_name +'</a>' : label_name;
                }
            }
        }
        return {
            label: label,
            name: label_name,
            url: label_url
        };
    },

    /**
     * 给模板setHtml代码的首元素添加版权标记ID
     */
    setHtmlAddID = function(obj, k){
        return obj.setHtml ? (obj.setHtml).replace(/^\s*((\<br\s?\/?\>|\<hr\s?\/?\>)+)?\<([a-zA-Z0-9]{1,10})/, '<$3 id="'+name+'-'+k+'"') : '';
    },

    /**
     * 取出附加的声明
     */
    getPostscript = function(container, selector, label, br, isarr){
        var i=0, content = isarr ? {} : '', postscript = findElems(container, 'input[id^="'+name+'-'+selector+'-"]');
        if(postscript.length>0){
            for(; i<postscript.length; i++){
                var htm = '<'+label+'>'+postscript[i].value+'</'+label+'>'+br;
                if(isarr){
                    var id = postscript[i].id;
                    id = id.substr(id.lastIndexOf('-')+1);
                    content[id] = {setHtml:htm};
                }else
                    content += htm;
            }
        }else if(selector.indexOf('author-')!=-1){
            content = getPostscript(container, selector.replace('author-', ''), label, br, isarr);
        }//console.log(content);
        return content;
    },

    /**
     * 获取配置中模板所设的代码标签
     */
    get_config_label = function(tpl){
        var htm, label='';
        if(isObject(tpl)){
            var k, content = tpl.content;
            for(k in content){
                htm = content[k].setHtml;
                if(htm)
                    break;
            }
        }else if(isString(tpl)){
            htm = tpl;
        }
        if(htm){
            label = /^\s*((\<br\s?\/?\>\s*|\<hr\s?\/?\>\s*)+)?\<([a-zA-Z0-9]{1,10})/.exec(htm);
            label = label[3]; // 根据模板中设的HTML代码来取出标签名
        }
        return label;
    },

    /**
     * 解析模板并生成标签元素
     */
    tplElement = function(tpl, container, notPostscript){
        var markContent = '',
        content = tpl.content,
        label = get_config_label(tpl),
        br = /^span|em|i|u|b|string|small/i.test(label) ? '<br>' : '';
        if(isString(content)){
            markContent = notPostscript ? content : getPostscript(container, 'author-top', label, br) + content + getPostscript(container, 'author-bottom', label, br);
        }else if(isObject(content)){
            var labels = {};
            if(!notPostscript){
                var postscripts = getPostscript(container, 'author-top', label, br, true);
                content = extend(postscripts, content);
                postscripts = getPostscript(container, 'author-bottom', label, br, true);
                content = extend(content, postscripts);//console.log(content);
            }
            for(var k in content){
                if(isObject(content[k])){
                    var o = {}, obj = getNodeLabel(content[k], container);
                    o[k] = obj.label;
                    o[k+'_name'] = obj.name;
                    o[k+'_url'] = obj.url;
                    labels[k] = o;
                    markContent += setHtmlAddID(content[k], k);
                }
            }
            for(var n in labels){
                markContent = markContent.replace(new RegExp('\\{'+n+'\\}|\\{'+n+'_name\\}|\\{'+n+'_url\\}|\\{if\\s('+n+'|'+n+'_name|'+n+'_url)\\}.+\\{\\/if\\}', 'g'), function(str, s1){
                    var _str = '';
                    switch (str) {
                        case '{'+n+'}':
                            _str = labels[n][n];
                            break;
                        case '{'+n+'_name}':
                            _str = labels[n][n+'_name'];
                            break;
                        case '{'+n+'_url}':
                            _str = labels[n][n+'_url'];
                            break;
                        default:
                            var _label = labels[n][s1];
                            if(_label){
                                // 解析if.../if。解析if查找的变量条件只允许一个，并且还不能else。。。。。。。。。。。。。。。。。。。。。。。。
                                _str = str.replace(new RegExp('^\\{if\\s'+s1+'\\}([^\\{]*.*[^\\}]*)\\{\\/if\\}$'), function(a, a1){
                                    var aa = a1.match(/\{([^\{\}]+)\}/g);//（来自 {source}早{source_url}）
                                    var txt = a1;
                                    for(var i in aa){
                                        var _ns = /\{([^\{\}\_]+)\_?([^\{\}]*)\}/.exec(aa[i]);
                                        var _n2 = _ns[1] + (_ns[2] ? '_'+_ns[2] : ''); // source  source_url
                                        var _lab = labels[_ns[1]];
                                        if(_lab || _n2=='url'){
                                            var v = _n2=='url' ? document.URL : (_lab ? _lab[_n2] : '');
                                            txt = txt.replace(new RegExp('\\{'+_n2+'\\}'), v||'');
                                        }
                                    }
                                    return txt;
                                });
                            }
                            break;//top{版权声明}
                    }
                    return _str;
                });
            }
        }
        if(markContent){
            // 转换url参数为当前地址
            markContent = markContent.replace(/\{url\}/g, document.URL);

            var markElement = document.createElement(isString(tpl.label) ? tpl.label : 'div');

            // 设置版权信息主容器节点的属性。
            if(tpl.attrs && isObject(tpl.attrs)){
                setAttrs(markElement, tpl.attrs, true);
            }
            markElement.id = name;
            markElement.innerHTML = markContent;
            return markElement;
        }
        return null;
    },

    /**
     * 生成文章内容与版权标记内容分隔的分隔符。
     */
    separatorNodes = function(separator){
        var separators=[];
        if(separator){
            var ss = (isString(separator) ? separator : 'br').split(/\s*\,\s*/);
            for(var i in ss){
                separators[i] = document.createElement(ss[i]);
            }
        }
        return separators;
    },

    /**
     * 把html标签加上换行符
     */
    rnHtml = function(html){
        return html.replace(/\<[a-z]{1,10}[1-5]?[^\<\>]*\>[\n\f\r\t\v\s]*\<\/[a-z]{1,10}[1-5]?\>|\<(p|h[1-5]|div|ul|ol|li)([^\<\>]*)\>|\<\/(p|h[1-5]|div|ul|ol|li)\>|(\<br\s*\/?\>)/igm, function(str, str1, str2, str3, str4){
            var rn = '';
            if(str1=='div' || str1=='li'){
                rn = '\r<'+str1+str2+'>';
            }else if(str1=='ul' || str1=='ol'){
                rn = '\r\t<'+str1+str2+'>';
            }else if(str1){
                rn = '\r<'+str1+str2+'>';
            }
            if(str3=='div' || str3=='li'){
                rn = '</'+str3+'>\r';
            }else if(str3){
                rn = '</'+str3+'>\r\n';
            }
            if(str4){
                rn = '\n';
            }
            return rn;
        });
    },

    /**
     * 运行复制功能
     */
    copy = function(e){
        var cf, 
        container, 
        removeNode, 
        removeAttr, 
        minCopy, 
        discern, 
        topInsert, 
        tpl, 
        separator, 
        rangeDeviate, 
        barrier, 
        barrierStyle,
        selector = config.selector, 
        assign = config.assign, 
        target = e.target || e.srcElement, 
        selectText = '', 
        tempNode;

        getSelection();

        tempNode = document.createElement('cm');
        tempNode.id = 'temp-'+name;
        tempNode.style.display = 'block';
        tempNode.style.fontFamily = 'inherit';//initial
        tempNode.style.position = 'fixed';
        tempNode.style.top = '0';
        tempNode.style.left = '-1px';
        tempNode.style.zIndex = '999999999999';
        tempNode.style.overflow = 'hidden';
        tempNode.style.width = '1px';
        tempNode.style.height = '1px';
        tempNode.style.background = '#FFF';

        if(selection.getRangeAt){
            // ie9-11 and chrome
            for(var i = 0; i < selection.rangeCount; i++) {
                var scContent = selection.getRangeAt(i).cloneContents();
                tempNode.appendChild(scContent);
                selectText += toString(selection.getRangeAt(i));
            }
        }else{
            // IE8
            tempNode.innerHTML = selection.htmlText;
            selectText = selection.text;// + '\r\n';
        }

        // 遍历多区域
        if(isArray(assign) && assign.length > 0){
            for(var i in assign){
                var csi = assign[i];
                container = parentElems(target, csi.selector, 0);
                if($(container).is(csi.selector)){
                    cf = csi;
                    break;
                }
            }
            if(!cf){
                var tl = 0;
                for(var i in assign){
                    var csi = assign[i], find_elems = findElems(tempNode, csi.selector);
                    for(var j=0; j<find_elems.length; j++){
                        var _tl = ($(find_elems[j]).text()).length;
                        if(tl==0 || (tl > 0 && _tl > tl)){
                            container = find_elems[j];
                            tl = _tl;
                            cf = csi;
                        }
                    }
                }
            }
            if(cf){
                // 取出多区域的配置
                removeNode = cf.removeNode != undefined ? cf.removeNode : config.removeNode;
                removeAttr = cf.removeAttr != undefined ? cf.removeAttr : config.removeAttr;
                barrier = cf.barrier != undefined ? cf.barrier : config.barrier;
                minCopy = cf.minCopy != undefined ? cf.minCopy : config.minCopy;
                discern = cf.discern != undefined ? cf.discern : config.discern;
                barrierStyle = cf.barrierStyle != undefined ? cf.barrierStyle : config.barrierStyle;
                rangeDeviate = cf.rangeDeviate != undefined ? cf.rangeDeviate : config.rangeDeviate;
                topInsert = cf.topInsert != undefined ? cf.topInsert : config.topInsert;
                tpl = isObject(cf.template) ? cf.template : config.template;
                separator = cf.separator != undefined ? cf.separator : config.separator;
            }else{
                return false;
            }
        }else if(selector){
            // 取出主区域的配置
            var scf = false;
            container = parentElems(target, selector, 0);
            if($(container).is(selector)){
                scf = true;
            }else{
                var tl = 0;
                var find_elems = findElems(tempNode, selector);
                for(var j=0; j<find_elems.length; j++){
                    var _tl = ($(find_elems[j]).text()).length;
                    if(tl==0 || (tl > 0 && _tl > tl)){
                        container = find_elems[j];
                        tl = _tl;
                        scf = true;
                    }
                }
            }
            if(scf){
                removeNode = config.removeNode;
                removeAttr = config.removeAttr;
                barrier = config.barrier;
                minCopy = config.minCopy;
                discern = config.discern;
                barrierStyle = config.barrierStyle;
                rangeDeviate = config.rangeDeviate;
                topInsert = config.topInsert;
                tpl = config.template;
                separator = config.separator;
            }else{
                return false;
            }
        }else{
            return false;
        }

        // 最小有多少个文字才插入版权标记。
        minCopy = $(container).find('input#'+name+'-author-min').val()|0 || $(container).find('input#'+name+'-min').val()|0 || $('body').find('input#'+name+'-min').val()|0 || minCopy;

        if(selectText.length >= minCopy){
            // 屏障功能barrier。
            var off, _barrier = $(container).find('input#'+name+'-author-bar').val() || $(container).find('input#'+name+'-bar').val() || $('body').find('input#'+name+'-bar').val();
            if(_barrier=='1' || _barrier=='true'){
                barrier = true;
            }else if(_barrier=='function.on'){
                off = false;
            }else if(_barrier=='function.off'){
                off = true;
            }else if(_barrier){
                barrier = _barrier;
            }
            if(barrier){
                if(typeof barrier === 'function'){
                    if(barrier(e, off)){
                        if(e.preventDefault){
                            e.preventDefault();
                        }else{
                            e.returnValue = false;
                        }
                        return false;
                    }
                }else{
                    if(e.preventDefault){
                        e.preventDefault();
                    }else{
                        e.returnValue = false;
                    }
                    if(isString(barrier)){
                        // 配置的参数是字符串时弹出屏障窗口。
                        barrierMessage(barrier, barrierStyle);
                    }
                    return false;
                }
            }

            var markContent, markElement, separators = [], hasRemove = false;

            // 识别CM标记
            if(discern){
                var sele = isString(discern) ? discern : '#'+name;
                $(container).find(sele).is(function(){
                    $(tempNode).find('#'+name).remove();
                    hasRemove = true;
                });
                $(container).find('#'+name+'-reprint').is(function(){
                    markContent = getOuterHTML($(container).find('#'+name+'-reprint'));
                    $(tempNode).find('#'+name+'-reprint').remove();
                    hasRemove = true;
                });
            }

            separators = separatorNodes(separator);
            if(!markContent){
                markElement = tplElement(tpl, container);
                if(markElement){
                    // 添加版权标记名并注明为转载（copyrightmark-reprint）。
                    markElement.id = name + '-reprint';
                }
            }else{
                markElement = document.createElement('div');
                markElement.innerHTML = markContent;
                markElement = markElement.childNodes[0];
            }

            if(markElement){
                var i;
                // 删除相关元素
                if(removeNode && isString(removeAttr)){
                    $(tempNode).find(removeNode).remove(); 
                    hasRemove = true;
                }

                // 删除元素属性
                if(removeAttr && isString(removeAttr)){
                    var 
                    tempNode_html = tempNode.innerHTML,
                    removeAttrStr = removeAttr.replace(/\,\ *|\-/g, function(str){// style, data-id  -->  style|data\\-id
                        if(str=='-'){
                            return '\\-';
                        }else{
                            return '|';
                        }
                    }),
                    newhtml = tempNode_html.replace(/\<[a-zA-Z]{1,10}[0-6]?.*\>/igm, function(str){
                        var soAttr = new RegExp('(\\ ('+removeAttrStr+')\\=\\\'[^\\<\\>\\\'\\n\\f\\r\\t\\v]*\\\'|\\ ('+removeAttrStr+')\\=\\"[^\\<\\>\\"\\n\\f\\r\\t\\v]*\\")', 'igm');
                        return str.replace(soAttr, '');
                    });
                    tempNode.innerHTML = newhtml;
                    hasRemove = true;
                }

                // 插入版权信息
                if(topInsert){
                    for(i in separators)
                        tempNode.insertBefore(separators[i], tempNode.childNodes[0]);
                    tempNode.insertBefore(markElement, tempNode.childNodes[0]);
                }else{
                    // 添加分隔符。
                    for(i in separators)
                        tempNode.appendChild(separators[i]);
                    tempNode.appendChild(markElement);
                }
                
                if(!hasRemove && !window.clipboardData){
                    var ecd, html = '<meta charset="utf-8">', text = '', separator_div, separator_text, nodeName;

                    e.preventDefault();
                    if(e.originalEvent){
                        ecd = e.originalEvent.clipboardData;
                    }else if(e.clipboardData){
                        ecd = e.clipboardData;
                    }
                    
                    ecd.setData("text/html", html+tempNode.innerHTML);

                    separator_div = document.createElement('div');
                    for(i in separators)
                        separator_div.appendChild(separators[i]);
                    
                    markElement.innerHTML = rnHtml(markElement.innerHTML);
                    text = markElement.innerText;
                    text = text.replace(/^[\n\f\r\t\v\s]+|[\n\f\r\t\v\s]+$/gm, '');

                    nodeName = markElement.nodeName;
                    text = (!topInsert ? '\r':'') + text + (nodeName=='p'||nodeName==''||nodeName=='' ? '\r\n' : '\r');
                    
                    // 把html标签加上换行符
                    separator_div.innerHTML = rnHtml(separator_div.innerHTML);
                    separator_text = separator_div.innerText;

                    text = topInsert ? text + separator_text + selection : selection + separator_text + text;
                    ecd.setData("text/plain", text);
                }else{
                    document.body.appendChild(tempNode);
                    tempContainer = document.getElementById('temp-'+name);
                    if(!hasGetStartEnd){
                        if(chrome){
                            startNode = selection.anchorNode;
                            startOffset = selection.anchorOffset;
                            endNode = selection.focusNode;
                            endOffset = selection.focusOffset;
                        }else if(ie8){
                            var msleng = 0,
                            scleng = rnReplace(selectText).length;
                            bodyTextLeng = -(document.body.innerText.length);
                            selection.moveStart("character", bodyTextLeng);
                            msleng = rnReplace(selectText).length + rangeDeviate;
                            startOffset = msleng - scleng;
                            endOffset = scleng;
                        }
                    }
                    if(selection.selectAllChildren){
                        selectTempNode(e, true);
                    }else{
                        if(chrome)
                            selection.removeAllRanges();
                        else if(ie8)
                            document.selection.empty();
                        selectTempNode(e);
                    }
                    window.setTimeout(function(){
                        tempContainer.innerHTML = '';

                        if(chrome){
                            selection.removeAllRanges();
                        }else if(ie8){
                            document.selection.empty();
                        }
                        
                        tempContainer.parentNode.removeChild(tempContainer);
                        
                        if(chrome){
                            var range = document.createRange();
                            range.setStart(startNode, startOffset);
                            range.setEnd(endNode, endOffset);
                            var seText = toString(range);
                            if(!seText){
                                range.setStart(endNode, endOffset);
                                range.setEnd(startNode, startOffset);
                            }
                            selection.addRange(range);
                        }else if(ie8){
                            if(rangeDeviate!==false){
                                selection.moveToElementText(document.body);
                                selection.moveStart("character", bodyTextLeng);
                                selection.moveEnd("character", bodyTextLeng);
                                selection.moveStart("character", startOffset);
                                selection.moveEnd("character", endOffset);
                                selection.select();
                            }
                        }
                        
                        hasGetStartEnd = true;
                        
                    });
                }
            }
        }
    },

    /**
     * 判断鼠标按下是否为左按键
     */
    isLeftButton = function(e){
        var eb = e.button;
        if(eb > 0)
            if(ie8)
                return eb == 1 ? true : false;
            else
                return false;
        else
            return true;
    },

    /**
     * 判断鼠标点击目标时的位置
     */
    eventPositions = function(e, type){
        //if(config.barrier!==false){
            if(e.type == type){
                startX = e.x;
                startY = e.y;
                $('#'+name+'-barrier-dialog').is(function(){
                    setTimeout(function(){
                        $('#'+name+'-barrier-dialog').remove();
                    }, 0);
                });
            }else{
                endX = e.x;
                endY = e.y;
            }
        //}
    },

    /**
     * 把页面内容中作者输入的配置参数转换为input标签
     * 网站的ajax调用方法：
     * copyrightmark.loadSet();
     */
    loadSet = function(){
        // 加载作者的设置
        if(config.allowAuthorSet){
            var i=0, del_elems=[],
            p = document.getElementsByTagName('p');
            for(; i<p.length; i++){
                var pp, phtml = p[i].innerHTML;
                if(pp = /^\s*(\<(strong|small|span|em|b|u|i)[^\<\>\r\n\t\v\f]*\>\s*)*(\{{3}(\-?[a-z]{1,10})\:([^\r\n\t\v\f]{1,200})\}{3})(\s*\<\/(i|u|b|em|span|small|strong)\>)*\s*$/i.exec(phtml)){//console.log(pp);
                    var elem = p[i], _name = pp[4], val = pp[5], html = (pp[1]||'') + val + (pp[6]||''), input;
                    if(_name.substr(0,1) == '-'){
                        _name = 'top' + _name;
                    }else if(_name == 'min' || _name == 'bar'){
                        _name = _name;
                    }else{
                        _name = 'bottom-' + _name;
                    }
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.id = name +'-author-'+ _name;
                    input.value = _name == 'min' ? val : html;
                    elem.parentNode.appendChild(input);
                    del_elems.push(elem);
                }
            }
            for(i in del_elems){
                del_elems[i].parentNode.removeChild(del_elems[i]);
            }
        }
    },

    // 载入文章显示的设置。
    loadShow = function(){
        if(config.showInArticle){
            var sia = config.showInArticle,
            tpl = config.template,
            topInsert = config.topInsert,
            separator = config.separator,
            selector = config.selector,
            notPostscript,
            insertContent = function(){
                var i,
                container = findElems(document, selector, 0);
                if(container){
                    var separators = separatorNodes(separator),
                    tplelem = tplElement(tpl, container, notPostscript);//console.log(notPostscript);
                    if(topInsert){
                        for(i in separators)
                            container.insertBefore(separators[i], container.childNodes[0]);
                        container.insertBefore(tplelem, container.childNodes[0]);
                    }else{
                        for(i in separators)
                            container.appendChild(separators[i], container.childNodes[0]);
                        container.appendChild(tplelem, container.childNodes[0]);
                    }
                }else{
                    console.log("The '"+selector+"' selector cannot find a matching element");
                }
            };
            if(isObject(sia)){
                tpl = isObject(sia.template) ? sia.template : tpl;
                topInsert = sia.topInsert != undefined ? sia.topInsert : topInsert;
                separator = sia.separator != undefined ? sia.separator : separator;
                selector = sia.selector != undefined ? sia.selector : selector;
                notPostscript = sia.notPostscript;
                insertContent();
            }else{
                insertContent();
            }
        }
    },

    /**
     * 初始运行插件
     * @param {params} 配置参数
     * 用户调用方法：copyrightmark({params});
     */
    run = function(params){
        var language = ($('html').attr('lang') || navigator.userLanguage || navigator.language).toLowerCase().replace('-', '_');
        if(language=='zh_cn'){
            var template = {
                template: { 
                    label: 'p',
                    content: {
                        notice: {
                            setHtml: '<span>\\u672c\\u6587\\u8457\\u4f5c\\u6743\\u5f52\\u4f5c\\u8005\\u6240\\u6709\\uff0c\\u8f6c\\u8f7d\\u8bf7\\u9644\\u4e0a\\u672c\\u58f0\\u660e\\u53ca\\u51fa\\u5904\\u94fe\\u63a5\\u3002</span><br>'
                        },
                        author: {
                            getNode: {
                                main:'head', 
                                name:'meta[name="author"]'
                            },
                            setHtml: '<span>\\u4f5c\\u8005\\uff1a{author} {if source}\\uff08\\u6765\\u81ea {source}\\uff09{/if}</span><br>'
                        },
                        source: {
                            getNode: {
                                main: 'head',
                                name: 'meta[property="og:site_name"]'
                            }
                        },
                        link: {
                            setHtml: '<span>\\u94fe\\u63a5\\uff1a<a href="{url}">{url}</a></span><br>'
                        }
                    }
                }
            };
            config = extend(defaultParams, template);
        }
        
        config = extend(defaultParams, isObject(params) ? params : {});

        loadSet();
        loadShow();
        
        $('body').on('copy.'+name, copy);

        $(document).on('click', function(){
            hasGetStartEnd = false;
        })

        .on('mousedown mouseup', function(e){
            if(isLeftButton(e)){
                eventPositions(e, 'mousedown');
            }
        })
        
        .on('touchstart touchend', function(e){
            eventPositions(e, 'touchstart');
        });
    },

    /**
     * 支持在页头调用运行插件的函数
     */
    ready = function(params){
        var loadrun = function(){run(params);};
        if(document.readyState === "complete"){
            setTimeout(loadrun, 1);
        }else if(document.addEventListener){
			document.addEventListener("DOMContentLoaded", loadrun, false);
			window.addEventListener("load", loadrun, false);
		}else{
			document.attachEvent("onreadystatechange", loadrun);
			window.attachEvent("onload", loadrun);
		}
    },
    
    init = function(params){
        if(document.body){
            run(params);
        }else{
            ready(params);
        }
    };

    var name = 'copyrightmark';
    var selection = null;
    var startX = 0;
    var startY = 0;
    var endX = 0;
    var endY = 0;
    var tempContainer = null;
    var hasGetStartEnd = false;
    var bodyTextLeng = 0;
    var startNode = null;
    var startOffset = null;
    var endNode = null;
    var endOffset = null;
    var chrome = window.getSelection || document.getSelection;
    var ie8 = document.selection;
    window.copyrightmark = init;
    window.copyrightmark.loadSet = function(){loadSet();};
    window.copyrightmark.loadShow = function(){loadShow();};
});