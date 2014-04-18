/**
 * phant
 * https://github.com/sparkfun/phant
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var events = require('events');

/**** Phant prototype ****/
var app = Phant.prototype;

/**** Expose Phant ****/
exports = module.exports = Phant;

/**** Expose Submodules ****/
Phant.HttpServer    = require('./lib/http_server');
Phant.HttpInput     = require('./lib/http_input');
Phant.HttpOutput    = require('./lib/http_output');
Phant.Validator     = require('./lib/validator');
Phant.TelnetManager = require('./lib/telnet_manager');

/**** Initialize a new Phant ****/
function Phant() {

  if (! (this instanceof Phant)) {
    return new Phant();
  }

  this.on('error', this.handleError);

  this.managers = [];
  this.inputs   = [];
  this.outputs  = [];

}

/**** Make Phant an event emitter ****/
Phant.prototype.__proto__ = events.EventEmitter.prototype;

/**** Log errors to console ****/
app.handleError = function() {

  console.error.apply(console, arguments);

};

/**
 * registerManager
 *
 * adds a new manager to the list of
 * managers
 */
app.registerManager = function(manager) {

  // push to list of managers
  this.managers.push(manager);

};

/**
 * registerInput
 *
 * adds a new input to the list of
 * inputs, and listens for data and
 * errors.
 */
app.registerInput = function(input) {

  // push to list of inputs
  this.inputs.push(input);

  // listen for data, and pipe it to outputs
  input.on('data', this.dataReceived.bind(this));

  // listen for clear events and tell the outputs
  // to wipe data if they are storing it
  input.on('clear', this.clearStream.bind(this));

  // pipe input errors to phant error handler
  input.on('error', this.handleError.bind(
    this,
    input.name,
    ': '
  ));

};

/**
 * registerOutput
 *
 * adds a new output to the list of
 * outputs, and listens for output errors.
 */
app.registerOutput = function(output) {

  // push to list of outputs
  this.outputs.push(output);

  // pipe output errors to phant error handler
  output.on('error', this.handleError.bind(
    this,
    output.name,
    ': '
  ));

};

/**
 * dataReceived
 *
 * send data to all registered outputs
 */
app.dataReceived = function(id, data) {

  // loop through all outputs and give
  // them the new data.
  this.outputs.forEach(function(output) {
    output.write(id, data);
  });

};

/**
 * clearStream
 *
 * wipe the data from all persistent stores
 */
app.clearStream = function(id) {

  // loop through all outputs and give
  // them the new data.
  this.outputs.forEach(function(output) {
    output.clear(id);
  });


};
