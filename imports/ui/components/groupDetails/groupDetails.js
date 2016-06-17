import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Meteor } from 'meteor/meteor';

import template from './groupDetails.html';
import { Groups } from '../../../api/groups/index';
import { name as GroupUninvited } from '../groupUninvited/groupUninvited';
import { name as GroupInvited } from '../groupInvited/groupInvited';
import { name as GroupMenuItems } from '../groupMenuItems/groupMenuItems';

class GroupDetails {
    constructor($stateParams, $scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        this.groupId = $stateParams.groupId;

        this.subscribe('groups');
        this.subscribe('users');

        this.helpers({
            group() {
                return Groups.findOne({
                    _id: $stateParams.groupId
                });
            },
            users() {
                return Meteor.users.find({});
            }
        });
    }

    save() {
        Groups.update({
            _id: this.group._id
        }, {
            $set: {
                name: this.group.name,
                desc: this.group.desc
            }
        }, (error) => {
            if (error) {
                console.log('Oops, unable to update the group...');
            } else {
                console.log('Done!');
            }
        });
    }
}

const name = 'groupDetails';

// create a module
export default angular.module(name, [
        angularMeteor,
        uiRouter,
        GroupUninvited,
        GroupInvited,
        GroupMenuItems
    ]).component(name, {
        template,
        controllerAs: name,
        controller: GroupDetails
    })
    .config(config);

function config($stateProvider) {
    'ngInject';

    $stateProvider.state('groupDetails', {
        url: '/groups/:groupId',
        template: '<group-details></group-details>',
        resolve: {
            currentUser($q) {
                if (Meteor.userId() === null) {
                    return $q.reject('AUTH_REQUIRED_GROUPS');
                } else {
                    return $q.resolve();
                }
            }
        }
    });
}
