import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './eventAdd.html';

import { Events } from '../../../api/events/index';
import { Groups } from '../../../api/groups/index';

import { name as DisplayNameFilter } from '../../filters/displayNameFilter';

class EventAdd {
    constructor($scope) {
        'ngInject';

        $scope.viewModel(this);

        this.event = {};

        $('#eventDate').datetimepicker();

        this.helpers({
            groups() {
                return Groups.find({
                    _id: { $ne: this.getReactively('event.groupId') }
                });
            },
            eventGroup() {
                return Groups.findOne({
                    _id: this.getReactively('event.groupId')
                });
            }
        });
    }

    selectGroup(group) {
        this.event.groupId = group._id;
    }
    createEvent() {
        this.event.owner = Meteor.user()._id;
        this.event.date = $('#eventDate').val();
        this.event.status = "ordering";
        Events.insert(this.event);
        this.reset();
    }
    reset() {
        this.event = {};
        $('#eventDate').val('');
    }
}

const name = 'eventAdd';

export default angular.module(name, [
    angularMeteor,
    DisplayNameFilter
]).component(name, {
    template,
    controllerAs: name,
    controller: EventAdd
});
