import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './groupInvited.html';
import { name as InvitedFilter } from '../../filters/invitedFilter';
import { name as DisplayNameFilter } from '../../filters/displayNameFilter';

class GroupInvited {
    constructor($scope) {
        'ngInject';

        $scope.viewModel(this);

        this.helpers({
            users() {
                return Meteor.users.find({});
            }
        });
    }

    remove(user) {
        Meteor.call('remove', this.group._id, user._id,
            (error) => {
                if (error) {
                    console.log('Oops, unable to remove!');
                } else {
                    console.log('Removed!');
                }
            }
        );
    }
}

const name = 'groupInvited';

// create a module
export default angular.module(name, [
    angularMeteor,
    InvitedFilter,
    DisplayNameFilter
]).component(name, {
    template,
    controllerAs: name,
    bindings: {
        group: '<'
    },
    controller: GroupInvited
});
