serverUri = "ws://www.codatlas.com:9020/socket"


var SourcePageDecorator = require("./SourcepageDecorator.js");
var MetadataProcessor = require("./MetadataProcessor.js");
var $ = require("jquery");

    // extract plain text from a code block
    function extractLine (a) {
        return $(a).text();
    }

    // Every connection protocol can be plugged in by implementing
    // request(blocks, successFunction).
    function request(blocks, onSuccessFunction) {
        ws = new WebSocket(serverUri);

        ws.onopen = function() {
            var req = [];
            $.each(blocks, function(i, b) {
                req.push(extractLine(b));
            });
            ws.send(JSON.stringify(req));
        };

        ws.onmessage = function(ev) {
            var blockMetaDataList = JSON.parse(ev.data);
            var res = [];
            // append meta data to raw data
            $.each(blocks, function(i, block) {
                blockMetaData = blockMetaDataList[i];
                res.push({
                        "block": block,
                        "meta_data": blockMetaData
                });
            });
            onSuccessFunction(res);
            ws.close();
        };

        ws.onclose = function() {
            console.log("closing websocket");
        };
    }

    // filter too long ot too short lines
    function filterCodeBlocks (blocks) {
        var res = [];
        blocks.each(function(a, d) {
            var line = extractLine($(d));
            line.length > 50 && line.length < 1e4 && res.push(d);
        });
        return res;
    }

    // collect potential HTML blocks with code
    function gatherCodeBlocks() {
        var raw_blocks =
                $("pre, code, .CodeMirror-lines, .dp-highlighter, .syntaxhighlighter")
                .filter(":visible")
                .filter(":not(pre *)")
                .filter(":not(.CodeMirror-lines *)")
                .filter(":not(.syntaxhighlighter *)")
                .filter(":not(.dp-highlighter *)");
        return filterCodeBlocks(raw_blocks);
    }

    var CODATLAS_DEFINITION_NODE_CLASSNAME = "ca-definition";

    var parseNodeClassName_ = function(kind) {
            if (kind == NodeKind.USAGE) return CODATLAS_USAGE_NODE_CLASSNAME;
            else return CODATLAS_DEFINITION_NODE_CLASSNAME;
    };

    // apply analyzed metadata to a DOM element.
    function applyDecoration(i, decoratedBlock) {
        var block = decoratedBlock["block"];
        var metaData = decoratedBlock["meta_data"];

        metaDataDocument = MetadataProcessor.process(metaData);

        nodeClickFuncMk = function (id) {
            return function() {
                window.open("http://www.codatlas.com/gotoSymbol/" + id);
            }
        };

        if (metaDataDocument.nodes) {
            $.each(metaDataDocument.nodes, function (i, node) {
                eventMap = {};
                eventMap.click = nodeClickFuncMk(node.signature);

                SourcePageDecorator.addSpanToDomTree(block, node, parseNodeClassName_(node.kind), eventMap);
            });
        }
    }

    // ask server for meta of the code blocks
    function analyzeCodeBlocks(onSuccessFunction) {
        var blocks = gatherCodeBlocks();
        request(blocks, onSuccessFunction);
    }

    // decorate meta to existing node
    function annoteCodeBlocks(annotatedBlocks) {
        $.each(annotatedBlocks, applyDecoration);
    }


    function run_snippet() {
        analyzeCodeBlocks(annoteCodeBlocks);
    }
    window.onload = run_snippet;

