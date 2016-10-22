/* global character */

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

setInterval(function ()
{
    loot();
    //Loot Chests

    if (character.items[0].q < potmin)
        parent.buy("hpot0", pot2buy);
    if (character.items[1].q < potmin)
        parent.buy("mpot0", pot2buy);
    //Buy Pots

    if (character.hp / character.max_hp < 0.6)
    {
        parent.use('hp');
        if (character.hp <= 100)
            parent.socket.emit("transport", {to: "main"});
        //Panic Button
    }
    if (character.mp / character.max_mp < 0.3)
        parent.use('mp');
    //Constrained Healing

    // Party leader
    var leader = get_player(character.party);

    // Current target and target of leader.
    var currentTarget = get_targeted_monster();
    var leaderTarget = get_target_of(leader);
    var targetTarget = get_target_of(currentTarget);

    // Change the target.
    if (!currentTarget || currentTarget !== leaderTarget) {
        // Current target is empty or other than the leader's.
        change_target(leaderTarget);
        currentTarget = get_targeted_monster();
    }

    // Attack the target.
    if (currentTarget && can_attack(currentTarget) && targetTarget === leader) {
        // Current target isn't empty and attackable.
        attack(currentTarget);
    }

    //Move to leader.
    if (!character.moving)
        // Move only if you are not already moving.
        move(leader.real_x, leader.real_y);

    set_message("Dpsing");
}, 1000 / 4);