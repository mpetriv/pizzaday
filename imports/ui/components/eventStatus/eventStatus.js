import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './eventStatus.html';
import { Events } from '../../../api/events/index';
import { Groups } from '../../../api/groups/index';

class EventStatus {
    constructor($scope, $reactive) {
        'ngInject';

        $reactive(this).attach($scope);

        this.helpers({
            status() {
                if (this.getReactively("event")) {
                    return Events.findOne(this.event._id).status;
                }
            },

            isLoggedIn() {
                return !!Meteor.userId();
            },

            currentUserId() {
                return Meteor.userId();
            },

            isOwner() {
                if (this.getReactively("event")) {
                    return this.isLoggedIn && this.event.owner === this.currentUserId;
                }
            },
        });
    }

    setStatus(status) {
        Meteor.call('setStatus', this.event._id, Meteor.user()._id, status,
            (error) => {
                if (error) {
                    console.log('Oops, unable to set status!');
                } else {
                    console.log('set status!');
                }
            }
        );
    }
}

const name = 'eventStatus';

// create a module
export default angular.module(name, [
    angularMeteor
]).component(name, {
    template,
    bindings: {
        event: '<'
    },
    controllerAs: name,
    controller: EventStatus
});
