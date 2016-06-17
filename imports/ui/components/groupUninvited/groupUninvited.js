import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './groupUninvited.html';
import { name as UninvitedFilter } from '../../filters/uninvitedFilter';
import { name as DisplayNameFilter } from '../../filters/displayNameFilter';

class GroupUninvited {
    constructor($scope) {
        'ngInject';

        $scope.viewModel(this);

        this.helpers({
            users() {
                return Meteor.users.find({});
            }
        });
    }

    invite(user) {
        console.log(user);
        Meteor.call('invite', this.group._id, user._id,
            (error) => {
                if (error) {
                    console.log('Oops, unable to invite!');
                } else {
                    console.log('Invited!');
                }
            }
        );
    }
}

const name = 'groupUninvited';

// create a module
export default angular.module(name, [
    angularMeteor,
    UninvitedFilter,
    DisplayNameFilter
]).component(name, {
    template,
    controllerAs: name,
    bindings: {
        group: '<'
    },
    controller: GroupUninvited
});
