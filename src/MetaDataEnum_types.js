//
// Autogenerated by Thrift Compiler (0.9.2)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//


NodeKind = {
  'PACKAGE' : 0,
  'FILE' : 1,
  'CLASS' : 2,
  'INTERFACE' : 3,
  'LOCAL' : 4,
  'FIELD' : 5,
  'GLOBAL' : 6,
  'METHOD' : 7,
  'FUNCTION' : 8,
  'USAGE' : 9,
  'DECORATOR' : 10,
  'URL' : 11,
  'ENUM' : 12,
  'CONSTRUCTOR' : 13,
  'TYPE_ALIAS' : 14,
  'TYPE_VARIABLE' : 15,
  'PROJECT' : 16,
  'UNKNOWN' : 100
};
Modifier = {
  'ABSTRACT' : 0,
  'STATIC' : 1,
  'INTERFACE' : 2,
  'PUBLIC' : 3,
  'PRIVATE' : 4
};
EdgeKind = {
  'REFERENCE' : 0,
  'REFERENCED_AT' : 1,
  'LOCATE' : 2,
  'LOCATED_AT' : 3,
  'INHERIT' : 4,
  'INHERITED_BY' : 5,
  'DECLARE' : 6,
  'DECLARED_AT' : 7,
  'HAS_MEMBER' : 8,
  'MEMBER_OF' : 9,
  'OVERRIDE' : 10,
  'OVERRIDED_BY' : 11,
  'HAS_TYPE' : 12,
  'TYPE_OF' : 13,
  'CALL' : 14,
  'CALLED_AT' : 15,
  'DECORATE' : 16,
  'DECORATED_BY' : 17
};
Severity = {
  'WARNNING' : 0,
  'ERROR' : 1
};


exports.NodeKind = NodeKind;
exports.Modifier = Modifier;
exports.EdgeKind = EdgeKind;
