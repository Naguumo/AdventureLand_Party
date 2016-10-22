/* global character */

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

var party_list =
        [{name: "Hajime", priority: 0.0},
            {name: "Kuro", priority: 0.0},
            {name: "", priority: 0.0},
            {name: "", priority: 0.0},
            {name: "", priority: 0.0},
            {name: "", priority: 0.0}];

var party_count = 2;

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

    var hipri = 0;
    for (var x = 0; x < party_count; x++) 
    {
        var target = get_player(party_list[x].name);
        if (target)
            change_target(target);
        party_list[x].priority = (target.max_hp - target.hp) / target.max_hp;
        //Assign Priorities
        
        if (party_list[x].priority > party_list[hipri].priority)
            hipri= x;
        //Find Highest Priority
    }

    var target = get_player(party_list[hipri].name);
    if (party_list[hipri].priority > .30 && !target.rip) 
    {
        change_target(target);
        set_message("Targetting: " + target.name);
        heal(target);
    }

    if (target && (target.real_x !== character.real_x || target.real_y !== character.real_y) && !target.rip)
        move(target.real_x, target.real_y);
}, 200); // Loop Delay