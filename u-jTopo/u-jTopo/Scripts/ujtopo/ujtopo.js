ujtopo = function (_config) {
    this.designer = _config == undefined ? false : _config.designer || false;
    this.config = _config;
    var initComponent = function () {
        ujtopo.apply(this, _config);
    };
};

ujtopo.prototype = function () {
    var titile = 'ujtopo';
    var id = '';
    var imglist = {
        background: '../Images/bg.png',
    };
    //节点
    var nodeList = [];
    //连接关系
    var linkList = [];
    //状态
    var nodeStatus = [];

    var canvasId = 'canvas';
    var canvas = null;
    var stage = null;
    var scene = null;
    var lineType = "1";
    var lineColor = '';
    getCanvas = function () { canvas = document.getElementById(canvasId); },

    getStage = function () { stage = new JTopo.Stage(canvas); },

    getScene = function () {
        scene = new JTopo.Scene(stage);
        scene.background = imglist.background;
    },
    //初始化H5面板
    init = function () {
        getCanvas();
        getStage();
        getScene();
    },
    dealArgs = function (args) {
        args.uid = "j_" + args.id;
        return args;
    },
    //添加节点
    addNode = function (args, func) {
        var n = new JTopo.Node(args.title);
        //n.setSize(50,50);  // 尺寸
        n.fontColor = "black";
        n.setImage(args.img, true);
        n.setLocation(args.x, args.y);
        n.dragable = this.designer;
        //if (clicked != undefined) {
        //    n.addEventListener("mouseup", clicked);
        //}
        nodeList.push({ args: dealArgs(args), node: n });
        scene.add(n);
        return n;
    },
    setLineType = function (lType) {
        lineType = lType;
    },
    setLineColor = function (lColor) {
        lineColor = lColor;
    },
    onLineEdit = function () {
        var beginNode = null;

        var tempNodeA = new JTopo.Node('tempA');;
        tempNodeA.setSize(1, 1);

        var tempNodeZ = new JTopo.Node('tempZ');;
        tempNodeZ.setSize(1, 1);

        var link = getLine(tempNodeA, tempNodeZ);

        scene.mouseup(function (e) {
            if (e.button == 2) {
                scene.remove(link);
                return;
            }
            if (e.target != null && e.target instanceof JTopo.Node) {
                if (beginNode == null) {
                    beginNode = e.target;
                    scene.add(link);
                    tempNodeA.setLocation(e.x, e.y);
                    tempNodeZ.setLocation(e.x, e.y);
                } else if (beginNode !== e.target) {
                    var endNode = e.target;
                    var l = getLine(beginNode, endNode);

                    var xArgs = findArgsByNode(beginNode);  //查找beginNode参数
                    var yArgs = findArgsByNode(endNode);  //查找endNode参数
                    linkList.push({ lineType: lineType, lineColor: lineColor, xArgs: xArgs, yArgs: yArgs });
                    scene.add(l);
                    beginNode = null;
                    scene.remove(link);
                } else {
                    beginNode = null;
                }
            } else {
                scene.remove(link);
            }
        });
        scene.mousedown(function (e) {
            if (e.target == null || e.target === beginNode || e.target === link) {
                scene.remove(link);
            }
        });

        scene.mousemove(function (e) {
            if (beginNode != undefined) {
                tempNodeZ.setLocation(e.x, e.y);
            }
        });
        scene.dbclick(function (event) {
            if (event.target == null) return;
            var e = event.target;
            scene.remove(e);
            if (e.elementType == "link") {
                var index = linkList.indexOf(e);
                linkList.splice(index, 1);
                console.log(linkList);
                scene.remove(e);
            }
            else {
                var index = nodeList.indexOf(e);
                nodeList.splice(index, 1);
                console.log(nodeList);
            }
        });
    },

    drawLine = function (nodeA, nodeZ) {
        var link = new JTopo.Link(nodeA, nodeZ);
        link.lineWidth = 3; // 线宽
        //link.dashedPattern = 10; // 虚线
        link.arrowsRadius = 10; //箭头大小
        //link.bundleOffset = 60; // 折线拐角处的长度
        //link.bundleGap = 20; // 线条之间的间隔
        //link.textOffsetY = 3; // 文本偏移量（向下3个像素）
        link.strokeColor = lineColor;
        scene.add(link);
        return link;
    },
    drawFoldLine = function (nodeA, nodeZ) {
        var link = new JTopo.FoldLink(nodeA, nodeZ);
        link.direction = "vertical";
        link.arrowsRadius = 10; //箭头大小
        link.lineWidth = 3; // 线宽
        link.bundleOffset = 60; // 折线拐角处的长度
        link.bundleGap = 20; // 线条之间的间隔
        link.textOffsetY = 3; // 文本偏移量（向下3个像素）
        //link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
        //link.dashedPattern = 5;
        link.strokeColor = lineColor;
        link.lineJoin = 'round';
        scene.add(link);
        return link;
    },
    drawReverseFoldLine = function (nodeA, nodeZ) {
        var link = new JTopo.FoldLink(nodeA, nodeZ);
        link.direction = "horizontal";
        link.arrowsRadius = 10; //箭头大小
        link.lineWidth = 3; // 线宽
        link.bundleOffset = 60; // 折线拐角处的长度
        link.bundleGap = 20; // 线条之间的间隔
        link.textOffsetY = 3; // 文本偏移量（向下3个像素）
        //link.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
        //link.dashedPattern = 5;
        link.strokeColor = lineColor;
        scene.add(link);
        return link;
    },
    getLine = function (nodeA, nodeZ) {
        switch (lineType) {
            case "1":
                return drawLine(nodeA, nodeZ);
            case "2":
                return drawFoldLine(nodeA, nodeZ);
            case "3":
                return drawReverseFoldLine(nodeA, nodeZ);
            default:
                return drawLine(nodeA, nodeZ);
        }
    },
    //查找节点
    findNode = function (id) {
        var n = null;
        var _nodes = nodeList;
        for (var i = 0; i < _nodes.length; i++) {
            var c = _nodes[i];
            if (c.args.uid == id)
                return c.node;
        }
        return n;
    },
    findArgsByNode = function (m) {
        var n = null;
        var _nodes = nodeList;
        for (var i = 0; i < _nodes.length; i++) {
            var c = _nodes[i];
            if (c.node == m)
                return c.args;
        }
        return n;
    }
    return {
        init: init,
        addNode: addNode,
        onLineEdit: onLineEdit,
        nodeList: nodeList,
        linkList: linkList,
        findNode: findNode,
        getLine: getLine,
        setLineType: setLineType,
        setLineColor: setLineColor
    }
}();