import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SSR } from 'meteor/meteorhacks:ssr';

import { Events } from './collection';
import { Groups } from '../groups/collection';

export function addToPreorder(eventId, userId, itemId, quantity) {
    check(eventId, String);
    check(userId, String);
    check(itemId, String);
    check(quantity, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const event = Events.findOne(eventId);

    if (!event) {
        throw new Meteor.Error(404, 'No such event!');
    }

    const group = Groups.findOne(event.groupId);

    if (this.userId !== userId && group.owner !== this.userId && !_.contains(group.invited.map(user => user.id), this.userId)) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    let inList = '';
    if (event.preorderList) {
        inList = event.preorderList.filter((item) => {
            return (item.itemId === itemId && item.userId === userId);
        })[0];
    }
    if (!inList) {
        Events.update(eventId, {
            $addToSet: {
                preorderList: {
                    'id': randString(10),
                    'userId': userId,
                    'itemId': itemId,
                    'quantity': quantity
                }
            }
        });
    } else {
        Events.update({ _id: eventId, 'preorderList.id': inList.id }, {
            $set: {
                'preorderList.$.quantity': quantity
            }
        });
    }
}

export function order(eventId, userId) {
    check(eventId, String);
    check(userId, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const event = Events.findOne(eventId);

    if (!event) {
        throw new Meteor.Error(404, 'No such event!');
    }

    const group = Groups.findOne(event.groupId);

    if (this.userId !== userId && group.owner !== this.userId && !_.contains(group.invited.map(user => user.id), this.userId)) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    let preorderList = event.preorderList.filter((item) => {
        return (item.userId === userId);
    });

    preorderList.forEach((item, index) => {
        Events.update(eventId, {
            $addToSet: { orderList: item }
        });
    });

    checkForOrdered(eventId, userId);
}

export function setStatus(eventId, userId, status) {
    check(eventId, String);
    check(userId, String);
    check(status, String);

    if (!this.userId) {
        throw new Meteor.Error(400, 'You have to be logged in!');
    }

    const event = Events.findOne(eventId);

    if (!event) {
        throw new Meteor.Error(404, 'No such event!');
    }

    if (this.userId !== userId || event.owner !== this.userId) {
        throw new Meteor.Error(404, 'No permissions!');
    }

    Events.update(eventId, {
        $set: { 'status': status }
    });
}

function checkForOrdered(eventId, userId) {

    const event = Events.findOne(eventId);

    if (!event) {
        throw new Meteor.Error(404, 'No such event!');
    }

    const group = Groups.findOne(event.groupId);

    if (!group) {
        throw new Meteor.Error(404, 'No such group!');
    }

    var orderedUsers = [];
    event.orderList.forEach((item, index) => {
        if (orderedUsers.indexOf(item.userId) === -1) {
            orderedUsers.push(item.userId);
        }
    });

    if (group.invited.length + 1 === orderedUsers.length && event.status === 'ordering') {
        Events.update(eventId, {
            $set: { 'status': "ordered" }
        });

        sendEmail(eventId);
    }
}

function sendEmail(eventId) {
    let event = Events.findOne({ '_id': eventId }, { fields: { 'date': 1, 'owner': 1, 'orderList': 1 } });
    let resultList = [];
    let totalByAllUsers = 0;

    if (event.orderList) {
        let orderList = [];
        let ids = [];

        event.orderList.forEach((item, index) => {
            if (orderList[item.userId]) {
                orderList[item.userId].push(item);
            } else {
                orderList[item.userId] = [];
                orderList[item.userId].push(item);
                ids.push(item.userId);
            }
        });

        ids.forEach((userId, index) => {
            var totalSum = 0;
            orderList[userId].forEach((item, index) => {
                totalSum += getItem(item.itemId).price * item.quantity * (getItem(item.itemId).coupon ? 0.8 : 1);
            });
            totalByAllUsers += totalSum;
            orderList[userId] = orderList[userId].map((item) => {
                var rObj = {};
                rObj['name'] = getItem(item.itemId).name;
                rObj['quantity'] = item.quantity;
                rObj['price'] = (getItem(item.itemId).price).formatMoney(2);
                rObj['coupon'] = getItem(item.itemId).coupon;
                rObj['sum'] = (item.quantity * getItem(item.itemId).price * (getItem(item.itemId).coupon ? 0.8 : 1)).formatMoney(2);
                return rObj;
            });

            resultList.push({
                'userId': userId,
                'userName': getUserName(getUser(userId)),
                'eventCreator': getUserName(getUser(event.owner)),
                'eventDate': event.date,
                'totalSum': totalSum.formatMoney(2),
                'items': orderList[userId]
            });
        });
    }

    const replyTo = 'noreply@pizzaday.mp.com';
    SSR.compileTemplate('forEventParticipant', Assets.getText('emailTemplates/forEventParticipant.html'));

    //send email to participants
    resultList.forEach((order, index) => {
        //don't send email to event creator
        if (order.userId !== event.owner) {
            const to = getContactEmail(Meteor.users.findOne(order.userId));
            if (Meteor.isServer && to) {
                Email.send({
                    to,
                    replyTo,
                    from: 'pizzaday.mp@gmail.com',
                    subject: 'PizzaDay Event: ' + event.date,
                    html: SSR.render('forEventParticipant', order)
                });
            }
        }
    });

    //send email to event creator
    const to = getContactEmail(Meteor.users.findOne(event.owner));
    SSR.compileTemplate('forEventOwner', Assets.getText('emailTemplates/forEventOwner.html'));

    let emailData = {};
    emailData["resultList"] = resultList;
    emailData["eventCreator"] = getUserName(getUser(event.owner));
    emailData["eventDate"] = event.date;
    emailData["totalByAllUsers"] = totalByAllUsers.formatMoney(2);
    if (Meteor.isServer && to) {
        Email.send({
            to,
            replyTo,
            from: 'pizzaday.mp@gmail.com',
            subject: 'PizzaDay Event: ' + event.date,
            html: SSR.render('forEventOwner', emailData)
        });
    }
}

function randString(x) {
    var s = "";
    while (s.length < x && x > 0) {
        var r = Math.random();
        s += (r < 0.1 ? Math.floor(r * 100) : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65)));
    }
    return s;
}

function getContactEmail(user) {
    if (user.emails && user.emails.length)
        return user.emails[0].address;

    if (user.services && user.services.google && user.services.google.email)
        return user.services.google.email;

    return null;
}

function getItem(itemId) {
    return Groups.findOne({}).menuItems.filter((item) => {
        return item.id === itemId
    })[0];
}

function getUser(userId) {
    return Meteor.users.findOne(userId);
}

function getUserName(user) {
    if (!user) {
        return '';
    }

    if (user.profile && user.profile.name) {
        return user.profile.name;
    }

    if (user.emails) {
        return user.emails[0].address;
    }

    return user;
}

Number.prototype.formatMoney = function(c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

Meteor.methods({
    addToPreorder,
    order,
    setStatus
});
