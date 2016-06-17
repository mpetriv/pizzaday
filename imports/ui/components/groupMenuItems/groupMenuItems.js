import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './groupMenuItems.html';
import { Groups } from '../../../api/groups/index';

/**
 * GroupMenuItems component
 */
class GroupMenuItems {
    constructor($scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        this.helpers({
            group() {
                if (!this.group) {
                    return '';
                }
                return Groups.findOne({ _id: this.group._id });
            }
        });
    }

    save(ritem, item) {
        ritem["id"] = item.id;
        ritem["owner"] = Meteor.user()._id;
        console.log(ritem);
        Meteor.call('updateMenuItem', this.group._id, Meteor.user()._id, ritem,
            (error) => {
                if (error) {
                    console.log('Oops, unable to update menu item!');
                } else {
                    console.log('updated!');
                }
            }
        );
    }

    addMenuItem() {
        var menuItem = {};
        menuItem['id'] = this.randString(10);
        menuItem['owner'] = Meteor.user()._id;
        menuItem['name'] = this.menuItemName;
        menuItem['price'] = this.menuItemPrice;

        Meteor.call('addMenuItem', this.group._id, Meteor.user()._id, menuItem,
            (error) => {
                if (error) {
                    console.log(error);
                    console.log('Oops, unable to add menu item!');
                } else {
                    console.log('added!');
                }
            }
        );

        this.reset();
    }

    remove(itemId) {
        Meteor.call('removeMenuItem', this.group._id, Meteor.user()._id, itemId,
            (error) => {
                if (error) {
                    console.log('Oops, unable to remove menu item!');
                } else {
                    console.log('removed!');
                }
            }
        );
    }

    setCoupon(itemId, value) {
        Meteor.call('setCoupon', this.group._id, Meteor.user()._id, itemId, value,
            (error) => {
                if (error) {
                    console.log('Oops, unable to set coupon!');
                } else {
                    console.log('set!');
                }
            }
        );
    }

    reset() {
        this.menuItemName = '';
        this.menuItemPrice = '';
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

const name = 'groupMenuItems';

// create a module
export default angular.module(name, [
    angularMeteor
]).component(name, {
    template,
    controllerAs: name,
    bindings: {
        group: '<'
    },
    controller: GroupMenuItems
});
