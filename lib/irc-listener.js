'use strict';

var irc = require('irc');

module.exports = {
  init: function initIrcListener(context) {
    if (context.irc.events || context.irc.client) {
      context.logger.info('IRC listener already initialized, skipping.');
      return;
    }

    var ircOptions = context.irc.options || {};
    // Check context options
    if (!ircOptions.server) {
      context.logger.error('No IRC server configured, unable to connect');
      process.exit(1);
      return;
    }

    context.logger.info('Connecting to IRC server %s port %d ...', ircOptions.server, ircOptions.port);
    context.irc.client = new irc.Client(ircOptions.server, ircOptions.nick, ircOptions);

    // TODO: add ping timeout handling, or wait for client support

    context.irc.events = context.irc.client;
    context.domain.add(context.irc.events);

    context.irc.handler.init(context);

    setInterval(function() {
      if (context.irc.client.nick !== ircOptions.nick) {
        context.logger.error('Nick is set to "%s" but it should be "%s"', context.irc.client.nick, ircOptions.nick);
        process.exit(1); // Let daemonize restart it
        return;
      }
      context.logger.info('Nick still equal to "%s"', ircOptions.nick);
    }, 5 * 60 * 1000); // 5 minutes

  },
  reload: function reloadIrcListener(context) {
    // Noop
  },
  close: function closeIrcListener(context) {
    context.logger.info('Disconnecting form IRC');
    if (!context.irc.client) {
      context.logger.warn('Cannot close IRC listener before starting it');
      return;
    }

    context.irc.client.disconnect();
    context.irc.client = null;

    context.irc.handler.close(context);
    context.domain.remove(context.irc.events);
    context.irc.events.removeAllListeners();
    context.irc.events = null;
  }
};
