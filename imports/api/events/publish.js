import { Meteor } from 'meteor/meteor';

import { Events } from './collection';

if (Meteor.isServer) {
    Meteor.publish('events', function() {
        return Events.find({});
    });
}
