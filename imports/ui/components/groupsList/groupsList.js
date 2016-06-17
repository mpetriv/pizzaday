import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './groupsList.html';
import { Groups } from '../../../api/groups/index';

import { name as GroupAdd } from '../groupAdd/groupAdd';
import { name as GroupRemove } from '../groupRemove/groupRemove';
import { name as GroupImage } from '../groupImage/groupImage';
import { name as GroupCreator } from '../groupCreator/groupCreator';

class GroupsList {
    constructor($scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        this.subscribe('groups');
        this.subscribe('images');
        this.subscribe('users');

        this.helpers({
            groups() {
                return Groups.find({});
            },
            isLoggedIn() {
                return !!Meteor.userId();
            },
            currentUserId() {
                return Meteor.userId();
            }
        });
    }

    isOwner(group) {
        return this.isLoggedIn && group.owner === this.currentUserId;
    }
}

const name = 'groupsList';

// create a module
export default angular.module(name, [
        angularMeteor,
        uiRouter,
        GroupAdd,
        GroupRemove,
        GroupImage,
        GroupCreator
    ]).component(name, {
        template,
        controllerAs: name,
        controller: GroupsList
    })
    .config(config);

function config($stateProvider) {
    'ngInject';
    $stateProvider
        .state('groups', {
            url: '/groups',
            template: '<groups-list></groups-list>'
        });
}
