import { Mongo } from 'meteor/mongo';

export const Groups = new Mongo.Collection('groups');

Groups.allow({
    insert(userId, group) {
        return userId && group.owner === userId;
    },
    update(userId, group, fields, modifier) {
        return userId && group.owner === userId;
    },
    remove(userId, group) {
        return userId && group.owner === userId;
    }
});
