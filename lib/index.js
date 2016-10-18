'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var sails = require('sails');
var changeCase = require('change-case');

module.exports = function(model, options) {
    return new Promise(function(resolve, reject) {
        if (model) {
            if (Object.keys(options).length <= 0) {
                return resolve(model);
            } else {
                if (model instanceof Array) {
                    var promise = _.map(model, function(item) {
                        return new Promise(function(resolve, reject) {
                            return populateObject(item, Object.keys(options), options)
                            .then(function(item) {
                                resolve(item);
                            }).catch(function(err) {
                                reject(err);
                            });
                        });
                    });
                    return Promise.all(promise).then(function(model) {
                        resolve(model);
                    }).catch(function(err) {
                        reject(err);
                    });
                } else {
                    return populateObject(model, Object.keys(options), options)
                    .then(function(model) {
                        resolve(model);
                    }).catch(function(err) {
                        reject(err);
                    });
                }
            }
        } else {
            return reject(new Error('Model ' + model));
        }
    });
};

function populateObject(model, keys, options) {
    return new Promise(function(resolve, reject) {
        if (keys.length > 0) {
            var key = keys[0];
            return populateModel(model, key, options[key])
            .then(function(populatedObject) {
                var clone = _.clone(model.toObject());
                clone[key] = populatedObject;
                keys = keys.length > 1 ? keys.shift() : [];
                return populateObject(clone, keys, options)
                .then(function(model) {
                    resolve(model);
                }).catch(function(err) {
                    reject(err);
                });
            }).catch(function(err) {
                reject(err);
            });
        } else {
            return resolve(model);
        }
    });
}

function populateModel(model, key, option) {
    return new Promise(function(resolve, reject) {
        var modelName = '';
        var populate = '';
        if (option instanceof Array) {
            modelName = changeCase.lower(key);
            populate = option;
        } else {
            modelName = changeCase.lower(option.model);
            populate = option.populate;
        }
        if (sails.models[modelName] && sails.models[modelName].find) {
            var query = sails.models[modelName].findOne(model[key].id);
            _.each(populate, function(pop) {
                query = query.populate(pop);
            });
            return query.then(function(populatedObject) {
                return resolve(populatedObject);
            }).catch(function(err) {
                return reject(err);
            });
        } else {
            return reject(new Error('Model ' + modelName + ' doesn\'t exsits'));
        }
    });
}
