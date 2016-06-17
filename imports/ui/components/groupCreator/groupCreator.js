import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './groupCreator.html';
import { name as DisplayNameFilter } from '../../filters/displayNameFilter';

/**
 * GroupCreator component
 */
class GroupCreator {
    constructor($scope) {
        'ngInject';

        $scope.viewModel(this);

        this.helpers({
            creator() {
                if (!this.group) {
                    return '';
                }
                const owner = this.group.owner;
                if (Meteor.userId() !== null && owner === Meteor.userId()) {
                    return 'me';
                }
                return Meteor.users.findOne(owner) || 'nobody';
            }
        });
    }
}

const name = 'groupCreator';

// create a module
export default angular.module(name, [
    angularMeteor,
    DisplayNameFilter
]).component(name, {
    template,
    controllerAs: name,
    bindings: {
        group: '<'
    },
    controller: GroupCreator
});
