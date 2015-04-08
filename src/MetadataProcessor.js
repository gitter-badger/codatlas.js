  var _ = require("underscore");
  var MetaDataEnums = require('./MetaDataEnum_types.js');

  /*
   * @constructor
   */
  var apply_ = function(rawMetadata) {
    var nodesMap_ = {};  // Index of nodes, "node.signature -> node".
    var nodesByLine_ = {};  // processed nodes for annotation in lines.
    var edgesMap_ = {};  // Index of edges. "edge.start_id -> edge".
    var reverseEdgesMap_ = {};  // Reverse index of edges. "edge.end_id -> edge".
    var rawNodes_ = {};
    var rawEdges_ = {};
    var referenceAtEdges_ = [];
    var outline_ = {};
    var edgesGroupByStartNode_ = {};

    var getOutline = function(root) {
      var declareEdges = getEdges_(root.signature, MetaDataEnums.EdgeKind.DECLARE);
      var children = filterNullElements_(_.map(declareEdges, function(edge) {
        return nodesMap_[edge.end_id];
      }));
      children = _.sortBy(children, function(node) {
        return node.range.start_loc.offset;
      });
      return {
        "text": root.display,
        "state": {
          "opened": true
        },
        "children": _.map(children, getOutline),
        "type": root.kind,
        "node": root
      };
    };

    var filterNullElements_ = function(list) {
      return _.filter(list, function(edge) {
        return edge !== undefined && edge !== null;
      });
    };

    var getEdges_ = function(startId, edgeKind) {
      return _.filter(edgesGroupByStartNode_[startId], function(edge) {
        return edge.kind === edgeKind
      });
    };

    rawNodes_ = rawMetadata.nodes;
    rawEdges_ = rawMetadata.edges;
    var fileNode = _.find(rawNodes_, function(node) {
      return node.kind === MetaDataEnums.NodeKind.FILE;
    });

    /* server does not return file node yet.
    if (fileNode === undefined) {
      return {
        available: false
      };
    }
    */

    _.each(rawNodes_, function(node) {
      return nodesMap_[node.signature] = node;
    });

    nodesByLine_ = _.groupBy(rawNodes_, function(node) {
      return node.range.start_loc.line;
    });

    edgesMap_ = _.groupBy(rawEdges_, function(edge) {
      return edge.start_id;
    });

    reverseEdgesMap_ = _.groupBy(rawEdges_, function(edge) {
      return edge.end_id;
    });

    _.each(rawEdges_, function(edge) {
      if (edge.kind === MetaDataEnums.EdgeKind.REFERENCE) {
        referenceAtEdges_.push({
          start_id: edge.end_id,
          end_id: edge.start_id,
          kind: MetaDataEnums.EdgeKind.REFERENCED_AT
        });
      }
    });

    edgesGroupByStartNode_ = _.groupBy(rawEdges_.concat(referenceAtEdges_), "start_id");

    // outline_ = getOutline(fileNode);
    return {
      // TODO(mengwei): Restructure this data structure to clear redundency.
      available: true,
      //fileSignature: fileNode.signature,
      nodes: rawNodes_,
      edges: rawEdges_,
      nodesMap: nodesMap_,
      edgesMap: edgesMap_,
      nodesByLine: nodesByLine_,
      reverseEdgesMap: reverseEdgesMap_,
      referenceAtEdgesMap: referenceAtEdges_,
      edgesGroupByStartNodeMap: edgesGroupByStartNode_,
      //outline: outline_
    }
  };

exports.process = apply_;
