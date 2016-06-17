import angular from 'angular';

const name = 'uninvitedFilter';

function UninvitedFilter(users, group) {
    if (!group) {
        return false;
    }

    return users.filter((user) => {
        // if not the owner and not invited
        return user._id !== group.owner && (group.invited.map(user => user.id) || []).indexOf(user._id) === -1;
    });
}

// create a module
export default angular.module(name, [])
    .filter(name, () => {
        return UninvitedFilter;
    });
