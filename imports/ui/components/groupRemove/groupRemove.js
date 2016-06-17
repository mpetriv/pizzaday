import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './groupRemove.html';
import { Groups } from '../../../api/groups/index';

class GroupRemove {
    remove() {
        if (this.group) {
            Groups.remove(this.group._id);
        }
    }
}

const name = 'groupRemove';

// create a module
export default angular.module(name, [
    angularMeteor
]).component(name, {
    template,
    bindings: {
        group: '<'
    },
    controllerAs: name,
    controller: GroupRemove
});
