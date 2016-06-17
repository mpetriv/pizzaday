import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Meteor } from 'meteor/meteor';

import template from './eventDetails.html';

import { Events } from '../../../api/events/index';
import { name as EventStatus } from '../eventStatus/eventStatus';
import { name as EventMenu } from '../eventMenu/eventMenu';


class EventDetails {
    constructor($stateParams, $scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        this.eventId = $stateParams.eventId;
        this.subscribe('events');
        
        this.helpers({
            event() {
                return Events.findOne({
                    _id: $stateParams.eventId
                });
            }
        });
    }
}

const name = 'eventDetails';

// create a module
export default angular.module(name, [
        angularMeteor,
        EventStatus,
        EventMenu,
        uiRouter
    ]).component(name, {
        template,
        controllerAs: name,
        controller: EventDetails
    })
    .config(config);

function config($stateProvider) {
    'ngInject';

    $stateProvider.state('eventDetails', {
        url: '/events/:eventId',
        template: '<event-details></event-details>',
        resolve: {
            currentUser($q) {
                if (Meteor.userId() === null) {
                    return $q.reject('AUTH_REQUIRED_EVENTS');
                } else {
                    return $q.resolve();
                }
            }
        }
    });
}
