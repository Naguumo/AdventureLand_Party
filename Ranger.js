/* global character */

var targetting = 0;
//Monster Range = 0, Character Range = 1

var mon1xp = 2000;
var mon1atk = 150;
//Preferred Monster Stats

var mon2xp = 800;
var mon2atk = 50;
//Alternate Monster Stats

var invspam = false;
//Invite Spamming

var prevx = 0;
var prevy = 0;
//Previous coords

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

var pos = 0;
var flipcd = 0;
var stuck = 2;
//Distance Maintainence Variables

setInterval(function ()
{
    set_message("Grinding...");

    loot();
    //Loot Chests

    if (invspam)
    {
        var parmem = get_nearest_solo_player();
        if (parmem)
            parent.socket.emit("party", {event: 'invite', id: parmem.id});
    }
    //Invite to Party

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


    var target = get_targeted_monster();
    if (!target) //Find Priority Monster
    {
        target = get_nearest_monster({min_xp: mon1xp, max_att: mon1atk});
        if (target)
        {
            change_target(target);
            move_to_position(target, enemydist);
        }
        else if (!target) //Find Alternate Monster
        {
            target = get_nearest_monster({min_xp: mon2xp, max_att: mon2atk});
            if (target)
            {
                change_target(target);
                move_to_position(target, enemydist);
            }
            else
                return;
        }
    }

    //Monster Searching

    if (can_attack(target))
        attack(target);
    //Attack

    if (pos >= 5)
        pos = 1;
    //Resetting Circle

    var enemydist;
    if (targetting === 0)
        enemydist = parent.G.monsters[target.mtype].range + 20;
    else if (targetting === 1)
        enemydist = character.range - 20;
    //Targetting

    move_to_position(target, enemydist);
    //Movement

    prevx = Math.ceil(character.real_x);
    prevy = Math.ceil(character.real_y);
    //Sets new coords to prev coords

}, 200); // Loop Delay

function move_to_position(target, enemydist) //Movement Algorithm
{
    get_pos(target.real_x - character.real_x, target.real_y - character.real_y);
    //Get Position

    var distmov = Math.sqrt(Math.pow(character.real_x - prevx, 2) + Math.pow(character.real_y - prevy, 2));
    if (distmov < stuck)
        pos++;
    if (parent.distance(character, target) <= enemydist && flipcd > 18)
        pos += 2;
        flipcd = 0;
    flipcd++;
    //Stuck Code

    if (pos === 1) //Player is left of enemy
        move(target.real_x - enemydist, target.real_y);
    else if (pos === 2) //Player is above enemy
        move(target.real_x, target.real_y - enemydist);
    else if (pos === 3) //Player is right of enemy
        move(target.real_x + enemydist, target.real_y);
    else if (pos === 4) //Player is below enemy
        move(target.real_x, target.real_y + enemydist);
}

function get_pos(distx, disty)
{
    if (distx > 0 && Math.abs(distx) < Math.abs(disty)) //Player is left of enemy
        pos = 1;
    else if (disty === 2 && Math.abs(distx) > Math.abs(disty)) //Player is above enemy
        pos = 2;
    else if (distx < 0 && Math.abs(distx) < Math.abs(disty)) //Player is right of enemy
        pos = 3;
    else if (disty > 0 && Math.abs(distx) > Math.abs(disty)) //Player is below enemy
        pos = 4;
}

function get_nearest_solo_player() //For Invitation Spamming
{
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