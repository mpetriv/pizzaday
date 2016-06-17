import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './groupAdd.html';
import { Groups } from '../../../api/groups/index';
import { name as GroupUpload } from '../groupUpload/groupUpload';
import { name as DisplayNameFilter } from '../../filters/displayNameFilter';

class GroupAdd {
    constructor($scope) {
        'ngInject';

        $scope.viewModel(this);

        this.group = {};
        this.invited = [];
        this.menuItems = [];

        this.helpers({
            usersToInvite() {
                return Meteor.users.find({
                    $and: [
                        { _id: { $nin: this.getCollectionReactively('invited').map(user => user._id) } },
                        { _id: { $ne: Meteor.userId() } }
                    ]
                });
            },

            menuItems() {
                return this.menuItems;
            },
        });
    }

    invite(user) {
        if (user._id !== Meteor.user()._id && !_.contains(this.invited, user._id)) {
            this.invited.push(user);
        }
    }

    remove(user) {
        if (user._id !== Meteor.user()._id && !_.contains(this.invited, user._id)) {
            const index = this.invited.indexOf(user);
            if (index >= 0) {
                this.invited.splice(index, 1);
            }
        }
    }

    addMenuItem(user) {
        var menuItem = {};
        menuItem['owner'] = Meteor.user()._id;
        menuItem['name'] = this.menuItemName;
        menuItem['price'] = this.menuItemPrice;

        this.menuItems.push(menuItem);
        this.menuItemName = '';
        this.menuItemPrice = '';
    }

    removeMenuItem(item) {
        console.log(this.menuItems);
        console.log(item);

        const index = this.menuItems.indexOf(item);
        if (index >= 0) {
            this.menuItems.splice(index, 1);
        }
        console.log(this.menuItems);
    }

    submit() {
        this.group.owner = Meteor.user()._id;
        this.group['invited'] = this.invited.map((user) => {
            var rObj = {};
            rObj['id'] = user._id;
            return rObj;
        });
        this.group['menuItems'] = this.menuItems.map((item) => {
            var rObj = {};
            rObj['id'] = this.randString(10);
            rObj['owner'] = item.owner;
            rObj['name'] = item.name;
            rObj['price'] = item.price;
            return rObj;
        });
        Groups.insert(this.group);
        this.reset();
    }

    reset() {
        this.group = {};
    }

    randString(x) {
        var s = "";
        while (s.length < x && x > 0) {
            var r = Math.random();
            s += (r < 0.1 ? Math.floor(r * 100) : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65)));
        }
        return s;
    }
}

const name = 'groupAdd';

export default angular.module(name, [
    angularMeteor,
    GroupUpload,
    DisplayNameFilter
]).component(name, {
    template,
    controllerAs: name,
    controller: GroupAdd
});
