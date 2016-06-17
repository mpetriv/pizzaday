import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './eventMenu.html';
import { Groups } from '../../../api/groups/index';
import { Events } from '../../../api/events/index';
//import { name as SelectedMenuFilter } from '../../filters/selectedMenuFilter';
import { name as DisplayNameFilter } from '../../filters/displayNameFilter';

class EventMenu {
    constructor($scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        let storedEvent = '';
        if (this.event) {
            storedEvent = this.event;
            localStorage.setItem('event', JSON.stringify(this.event));
        } else {
            storedEvent = JSON.parse(localStorage.getItem("event"));
        }

        this.handle_groupMenu = this.subscribe('groupMenu', () => {
            return [storedEvent.groupId]
        });
        //need for 'Methods.checkForOrdered' call from 'Methods.order'
        this.subscribe('groupInvited', () => {
            return [storedEvent.groupId]
        });
        this.handle_events = this.subscribe('events');
        this.subscribe('users');

        // component helpers
        this.helpers({
            menu() {
                if (this.handle_groupMenu.ready()) {
                    return Groups.findOne({}).menuItems;
                }
            },

            selectedMenu() {
                if (this.handle_events.ready()) {
                    let event = Events.findOne({ _id: storedEvent._id }, { fields: { selectedMenu: 1 } });
                    if (event.selectedMenu) {
                        return event.selectedMenu.filter((item) => {
                            return item.userId === Meteor.userId();
                        });
                    }
                    return '';
                }
            },

            preorderList() {
                if (this.handle_events.ready()) {
                    let event = Events.findOne({ _id: storedEvent._id }, { fields: { preorderList: 1 } });
                    if (event.preorderList) {
                        return event.preorderList.filter((item) => {
                            return item.userId === Meteor.userId();
                        });
                    }
                    return '';
                }
            },

            orderList() {
                if (this.handle_events.ready()) {
                    let event = Events.findOne({ _id: storedEvent._id }, { fields: { orderList: 1 } });
                    if (event.orderList) {
                        let orderList = [];
                        let ids = [];
                        let resultList = [];
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
                                totalSum += this.getItem(item.itemId).price * item.quantity * (this.getItem(item.itemId).coupon ? 0.8 : 1);
                            });
                            resultList.push({ 'userId': userId, 'totalSum': totalSum, items: orderList[userId] });
                        });
                        return resultList;
                    }
                    return '';
                }
            },

        });
    }

    //component methods
    selectMenu(itemId) {
        Events.update(this.event._id, {
            $addToSet: {
                selectedMenu: { 'userId': Meteor.user()._id, 'itemId': itemId }
            }
        });
    }

    getItem(itemId) {
        return Groups.findOne({}).menuItems.filter((item) => {
            return item.id === itemId
        })[0];
    }

    addToPreorder(itemId) {
        Meteor.call('addToPreorder', this.event._id, Meteor.user()._id, itemId, this.pr[itemId].quantity,
            (error) => {
                if (error) {
                    console.log('Oops, unable add to preorder!');
                } else {
                    console.log('added to preorder!');
                }
            }
        );
    }

    order() {
        Meteor.call('order', this.event._id, Meteor.user()._id,
            (error) => {
                if (error) {
                    console.log('Oops, unable add to preorder!');
                } else {
                    console.log('added to preorder!');
                }
            }
        );
    }

    getTotalByUsers(orders) {
        var total = 0;
        orders.forEach((order, index) => {
            total += order.totalSum;
        });
        return total;
    }

    getUser(userId) {
        return Meteor.users.findOne(userId);
    }
}

const name = 'eventMenu';

// create a module
export default angular.module(name, [
    angularMeteor,
    //SelectedMenuFilter,
    DisplayNameFilter
]).component(name, {
    template,
    controllerAs: name,
    bindings: {
        event: '<'
    },
    controller: EventMenu
});
