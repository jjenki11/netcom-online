/*
 * This is an Emitter that allows both global and remote sending
 */

var events = require('events');
var logger = require('services/Logger').logger;
var cat = 'EchoEmitter';//__filename;
logger.setCategoryLogLevel(cat, 0); //off by default...cause this sucker be loud!
var SIO_NAMESPACE = require('Common').SIO_NAMESPACE;

/** @namespace
 * @description This is an Emitter that allows both global and remote sending
 * @type EchoEmitter
 * @augments events.eventEmitter
 * @fires EchoEmitter#emit
 * @borrows emit as Emitter
 * @borrows on as Listener
 * @borrows removeListener as Disconnecter
 */

exports.EchoEmitter = function(theSocket)
{
    
    var emitter = new events.EventEmitter();
    emitter.setMaxListeners(20); // Default is 10
    /**
    * Emitted when a signal is caught with a message Type
    * @event EchoEmitter#emit
    * @param {String} messageType - type of message to be emitted
    * @param {String} message - content of message being emitted
    * @param {function} callback - an optional function that the recieving handler may call if desired.
    * @param {String} zone - determines the zone where message is sent to (global/remote or local)
    */

    this.emit = function(messageType, message, callback, zone)
    {
        if(typeof callback === 'string' || callback instanceof String) /** temporary check to prevent against missed elements moving to the current api*/
        {
            console.error("emit called with incorrect parameters, this has been updated type:" + messageType + " Data:" + JSON.stringify(message) + " callback:" + callback);
            console.trace()
            zone = callback;
            callback = undefined;
        }
        if (!zone) zone = 'global';
        logger.log(function() {return 'Emitting for ' + messageType + ' message ' + JSON.stringify(message);}, cat, logger.levels.FINEST);
        if(zone == 'global' || zone == 'remote')
            theSocket.emit(messageType, message, callback);
        if(zone != 'remote')
            emitter.emit(messageType, message, callback);
    };
    
    /**
    * Adds a global or remote listener 
    * @event EchoEmitter#on
    * @param {String} messageType - type of message to be listened for
    * @param {Function} listener - listener function which is performed when message is received
    * @param {String} zone - determines the zone where message is sent from (global or remote)
    */
    this.on = function(messageType, listener, zone)
    {
        
        if (!zone) zone = 'global';
        logger.log('adding handler for ' + messageType, cat, logger.levels.FINEST);
        //register on events to both
        if(zone == 'global' || zone == 'remote'){
            theSocket.on(messageType, listener);
        }
        if(zone != 'remote'){
            emitter.on(messageType, listener);
        }
    };
    /**
    * Removes a global or remote listener 
    * @event EchoEmitter#removeListener
    * @param {String} messageType - type of message to remove handler from
    * @param {Function} listener - listener function which is performed when message is received
    * @param {String} zone - determines the zone where handler is removed from (global or remote)
    */    
    this.removeListener = function(messageType, listener, zone)
    {
        if (!zone) zone = 'global';
        if(zone == 'global' || zone == 'remote')
            theSocket.removeListener(messageType, listener);
        if(zone != 'remote')
            emitter.removeListener(messageType, listener);
    };
};
