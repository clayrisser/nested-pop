var Promise = require('bluebird');
var _ = require('lodash');
var changeCase = require('change-case');
var sails = global.sails;

module.exports = function(parentModel, options) {
  return new Promise(function(resolve, reject) {
    if (!parentModel) reject(new Error('Parent model is \'' + parentModel + '\''));
    if (!options || typeof options !== 'object' || Object.keys(options).length <= 0) resolve(parentModel);
    if (Array.isArray(parentModel)) {
      nestedPopulateParentArray(parentModel, options).then(function(nestedPopulatedParentArray) {
        resolve(nestedPopulatedParentArray);
      }).catch(function(err) {
        reject(err);
      });
    } else {
      nestedPopulateParentObject(parentModel, options).then(function(nestedPopulatedParentObject) {
        resolve(nestedPopulatedParentObject);
      }).catch(function(err) {
        reject(err);
      });
    }
  });
};

function nestedPopulateParentArray(parentArray, options) {
  var promise = _.map(parentArray, function(parentObject) {
    return nestedPopulateParentObject(parentObject, options);
  });
  return Promise.all(promise);
}

function nestedPopulateParentObject(parentObject, options) {
  var promise = _.map(options, function(option, key) {
    if (!parentObject[key]) return null;
    if (typeof option === 'string') option = [option];
    if (Array.isArray(option)) {
      option = {
        as: key.substring(key.length - 1) === 's' ? key.substring(0, key.length - 1) : key,
        populate: option
      };
    }
    if (!Array.isArray(option.populate)) option.populate = [option.populate.toString()];
    var childModelName = option.as;
    return populateChildModel(childModelName, key, parentObject[key], option.populate).then(function(populatedChildDetails) {
      parentObject[populatedChildDetails.propertyName] = populatedChildDetails.model;
      return populatedChildDetails.model;
    });
  });
  return Promise.all(promise).then(function(response) {
    return parentObject;
  });
}

function populateChildModel(childModelName, propertyName, childModel, populate) {
  childModelName = changeCase.lower(childModelName);
  if (!sails.models[childModelName]) throw new Error('Model \'' + childModelName + '\' does not exits');
  if (Array.isArray(childModel)) {
    return populateChildArray(childModelName, childModel, populate).then(function(populatedChildArray) {
      return {
        model: populatedChildArray,
        propertyName: propertyName
      };
    });
  } else {
    return populateChildObject(childModelName, childModel, populate).then(function(populatedChildObject) {
      return {
        model: populatedChildObject,
        propertyName: propertyName
      };
    });
  }
}

function populateChildArray(childModelName, childArray, populate) {
  var promise = _.map(childArray, function(childObject) {
    return populateChildObject(childModelName, childObject, populate);
  });
  return Promise.all(promise);
}

function populateChildObject(childModelName, childObject, populate) {
  var query = sails.models[childModelName].findOne(childObject.id);
  _.each(populate, function(propertyToPopulate) {
    query = query.populate(propertyToPopulate);
  });
  return query;
}
