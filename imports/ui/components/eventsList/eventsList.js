import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './eventsList.html';

import { Events } from '../../../api/events/index';
import { Groups } from '../../../api/groups/index';

import { name as EventAdd } from '../eventAdd/eventAdd';
import { name as EventRemove } from '../eventRemove/eventRemove';
import { name as EventCreator } from '../eventCreator/eventCreator';


class EventsList {
    constructor($scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        this.subscribe('groups');
        this.subscribe('events');
        this.subscribe('users');

        this.helpers({
            events() {
                return Events.find({}, { sort: { date: -1 } });
            },

            isLoggedIn() {
                return !!Meteor.userId();
            },

            currentUserId() {
                return Meteor.userId();
            }
        });
    }

    isOwner(event) {
        console.log(event);
        return this.isLoggedIn && event.owner === this.currentUserId;
    }
    getGroupName(groupId) {
        return Groups.findOne(groupId).name;
    }
}

const name = 'eventsList';

export default angular.module(name, [
        angularMeteor,
        EventAdd,
        EventRemove,
        EventCreator,
        uiRouter
    ]).component(name, {
        template,
        controllerAs: name,
        controller: EventsList
    })
    .config(config);

function config($stateProvider) {
    'ngInject';
    $stateProvider
        .state('events', {
            url: '/events',
            template: '<events-list></events-list>'
        });
}
