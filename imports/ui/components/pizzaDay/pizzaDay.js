import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './pizzaDay.html';
import { name as Navigation } from '../navigation/navigation';
import { name as EventsList } from '../eventsList/eventsList';
import { name as EventDetails } from '../eventDetails/eventDetails';
import { name as GroupsList } from '../groupsList/groupsList';
import { name as GroupDetails } from '../groupDetails/groupDetails';

class PizzaDay {}

const name = 'pizzaDay';

export default angular.module(name, [
        angularMeteor,
        uiRouter,
        Navigation,
        EventsList,
        EventDetails,
        GroupsList,
        GroupDetails,
        'accounts.ui'
    ]).component(name, {
        template,
        controllerAs: name,
        controller: PizzaDay
    })
    .config(config)
    .run(run);

function config($locationProvider, $urlRouterProvider) {
    'ngInject';

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/events');
}

function run($rootScope, $state) {
    'ngInject';

    $rootScope.$on('$stateChangeError',
        (event, toState, toParams, fromState, fromParams, error) => {
            if (error === 'AUTH_REQUIRED') {
                $state.go('events');
            }
        }
    );
}
