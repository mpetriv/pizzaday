import _ from 'underscore';

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Groups } from './collection';

export function invite(groupId, userId) {
    check(groupId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const group = Groups.findOne(groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    if (group.owner !== this.userId) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    if (userId !== group.owner && !_.contains(group.invited.map(user => user.id), userId)) {
        Groups.update(groupId, {
            $addToSet: {
                invited: { 'id': userId }
            }
        });
    }
}

export function remove(groupId, userId) {
    check(groupId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const group = Groups.findOne(groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    if (group.owner !== this.userId) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    if (userId !== group.owner && _.contains(group.invited.map(user => user.id), userId)) {
        Groups.update(groupId, {
            $pull: {
                invited: { 'id': userId }
            }
        });
    }
}

export function updateMenuItem(groupId, userId, item) {

    check(groupId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const group = Groups.findOne(groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    if (group.owner !== this.userId && !_.contains(group.invited.map(user => user.id), userId)) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    Groups.update({
        _id: groupId,
        'menuItems.id': item.id
    }, {
        $set: {
            'menuItems.$.name': item.name,
            'menuItems.$.price': item.price
        }
    });
}

export function addMenuItem(groupId, userId, menuItem) {

    check(groupId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const group = Groups.findOne(groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    if (group.owner !== this.userId && !_.contains(group.invited.map(user => user.id), userId)) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    Groups.update(groupId, {
        $addToSet: {
            menuItems: menuItem
        }
    });
}

export function removeMenuItem(groupId, userId, itemId) {

    check(groupId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const group = Groups.findOne(groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    if (group.owner !== this.userId && !_.contains(group.invited.map(user => user.id), userId)) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    Groups.update(groupId, {
        $pull: {
            menuItems: { 'id': itemId }
        }
    });
}

export function setCoupon(groupId, userId, itemId, value) {

    check(groupId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const group = Groups.findOne(groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    if (group.owner !== this.userId && !_.contains(group.invited.map(user => user.id), userId)) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    Groups.update({
        _id: groupId,
        'menuItems.id': itemId
    }, {
        $set: {
            'menuItems.$.coupon': value
        }
    });
}

Meteor.methods({
    invite,
    remove,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    setCoupon
});
