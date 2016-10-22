/* global character */

var targetting = 0;
//Monster Range = 0, Character Range = 1

var prevx = 0;
var prevy = 0;
//Previous coords

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

var angle;
var flipcd = 0;
var stuck = 2;
//Distance Maintainence Variables

setInterval(function ()
{
    set_message("Grinding...");

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



    var charx = character.real_x;
    var chary = character.real_y;
    //Character Location

    var target = get_targeted_monster();
    if (!target)
    {
        target = get_nearest_monster({min_xp: 2000, max_att: 150});
        if (target)
        {
            change_target(target);
            angle = Math.atan2(target.real_y - chary, target.real_x - charx);
        }
        else if (!target)
        {
            target = get_nearest_monster({min_xp: 800, max_att: 50});
            if (target)
            {
                change_target(target);
                angle = Math.atan2(target.real_y - chary, target.real_x - charx);
            }
            else
                return;
        }
    }
    //Monster Searching

    var enemydist;
    if (targetting === 0)
        enemydist = parent.G.monsters[target.mtype].range + 20;
    else if (targetting === 1)
        enemydist = character.range - 10;
    //Targetting

    if (can_attack(target))
        attack(target);
    //Attack

    var parmem = get_nearest_solo_player();
    if (parmem)
        parent.socket.emit("party", {event: 'invite', id: parmem.id});
    //Invite to Party

    var distx = target.real_x - charx;
    var disty = target.real_y - chary;
    if (!angle && target)
        angle = Math.atan2(disty, distx);
    //Enemy Distance and Angle

    var chx = charx - prevx;
    var chy = chary - prevy;
    var distmov = Math.sqrt(chx * chx + chy * chy);
    if (distmov < stuck)
        angle = angle + Math.PI * 2 * 0.125;
    if (parent.distance(character, target) <= enemydist && flipcd > 18)
    {
        angle = angle + Math.PI * 2 * 0.35;
        flipcd = 0;
    }
    flipcd++;
    //Stuck Code
    var new_x = target.real_x + enemydist * Math.cos(angle);
    var new_y = target.real_y + enemydist * Math.sin(angle);
    move(new_x, new_y);
    //Credit to /u/idrum4316
    //Following/Maintaining Distance

    prevx = Math.ceil(charx);
    prevy = Math.ceil(chary);
    //Sets new coords to prev coords

}, 200); // Loop Delay

function get_nearest_solo_player() {
    var min_d = 999999, target = null;
    for (var id in parent.entities)
    {
        var current = parent.entities[id];
        if (current.player === false || current.dead || current.party)
            continue;
        var c_dist = parent.distance(character, current);
        if (c_dist < min_d)
            min_d = c_dist, target = current;
        else if (current.player === true)
            target = current;
    }
    return target;
    //Credit to /u/Sulsaries
}