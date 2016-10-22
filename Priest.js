/* global character */

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

var party_list =
        [{name: "Hajime", priority: 1.0},
            {name: "Kuro", priority: 0.0},
            {name: "", priority: 0.0},
            {name: "", priority: 0.0},
            {name: "", priority: 0.0},
            {name: "", priority: 0.0}];

var party_count = 0;

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

    //Set target to null;
    var target = null;
    //set_message(party_list[0].name);

    for (var x = 0; x < party_count; x++) {
        set_message("Setting Priority");
        target = get_player(party_list[x].name);
        set_message("Not broken!");
        set_message(target.name);
        if (target)
            change_target(target);
        party_list[x].priority = (target.max_hp - target.hp) / target.max_hp;
        set_message(party_list[x].priority);
        set_message("Priority set.");
    }

    var highest_priority = 0;
    for (var x = 0; x < party_count; x++) {
        set_message("Finding highest priority.");
        if (party_list[x].priority > party_list[highest_priority].priority) {
            highest_priority = x;
        }
    }
    set_message("Highest priority found.");


    //target = get_player(party_list[0].name);

    target = get_player(party_list[highest_priority].name);
    if (party_list[highest_priority].priority > .10 && !target.rip) {
        if (target)
            change_target(target);
        heal(target);
        set_message("Healing");
    }

    if ((target.real_x !== character.real_x) || (target.real_y !== character.real_y) && !target.rip) {
        move(
                character.real_x + (target.real_x - character.real_x),
                character.real_y + (target.real_y - character.real_y)
                );
        set_message("Moving to Priority");
    }
}, 200); // Loop Delay