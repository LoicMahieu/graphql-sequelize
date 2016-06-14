'use strict';

var _typeMapper = require('./typeMapper');

var typeMapper = _interopRequireWildcard(_typeMapper);

var _graphql = require('graphql');

var _graphqlRelay = require('graphql-relay');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

module.exports = function (Model) {
  let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var result = Object.keys(Model.rawAttributes).reduce(function (memo, key) {
    if (options.exclude && ~options.exclude.indexOf(key)) return memo;
    if (options.only && ! ~options.only.indexOf(key)) return memo;

    var attribute = Model.rawAttributes[key],
        type = attribute.type;

    if (options.map) {
      if (typeof options.map === 'function') {
        key = options.map(key) || key;
      } else {
        key = options.map[key] || key;
      }
    }

    memo[key] = {
      type: typeMapper.toGraphQL(type, Model.sequelize.constructor)
    };

    if (memo[key].type instanceof _graphql.GraphQLEnumType) {
      memo[key].type.name = `${ Model.name }${ key }EnumType`;
    }

    if (!options.allowNull) {
      if (attribute.allowNull === false || attribute.primaryKey === true) {
        memo[key].type = new _graphql.GraphQLNonNull(memo[key].type);
      }
    }

    return memo;
  }, {});

  if (options.globalId) {
    result.id = (0, _graphqlRelay.globalIdField)(Model.name, instance => instance[Model.primaryKeyAttribute]);
  }

  return result;
};