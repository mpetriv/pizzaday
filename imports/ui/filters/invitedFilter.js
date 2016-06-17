import angular from 'angular';

const name = 'invitedFilter';

function InvitedFilter(users, group) {
    if (!group) {
        return false;
    }

    return users.filter((user) => {
        // if not the owner and invited
        return user._id !== group.owner && (group.invited.map(user => user.id) || []).indexOf(user._id) >= 0;
    });
}

// create a module
export default angular.module(name, [])
    .filter(name, () => {
        return InvitedFilter;
    });
