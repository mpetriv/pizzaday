import { Meteor } from 'meteor/meteor';

import { Groups } from './collection';

if (Meteor.isServer) {
    Meteor.publish('groups', function() {
        const selector = {
            $or: [{
                // when logged in user is invited
                $and: [{
                    'invited.id': this.userId
                }, {
                    invited: {
                        $exists: true
                    }
                }]
            }, {
                // when logged in user is the owner
                $and: [{
                    owner: this.userId
                }, {
                    owner: {
                        $exists: true
                    }
                }]
            }]
        };

        return Groups.find({});
    });

    Meteor.publish('groupMenu', function(groupId) {
        return Groups.find({ '_id': groupId }, { fields: { 'menuItems': 1 } });
    });

    Meteor.publish('groupInvited', function(groupId) {
        return Groups.find({ '_id': groupId }, { fields: { 'invited': 1 } });
    });
}
