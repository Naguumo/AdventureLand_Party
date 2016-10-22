/* global character */

var targetting = 2;
//Monster Range = 0, Character Range = 1, Tank Range = 2

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

var angle;
var stuck = 3;
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
            angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
        }
        else if (!target) //Find Alternate Monster
        {
            target = get_nearest_monster({min_xp: mon2xp, max_att: mon2atk});
            if (target)
            {
                change_target(target);
                angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
            }
            else
                return;
        }
    }
    //Monster Searching

    if (can_attack(target))
        attack(target);
    //Attack

    if (targetting === 0)
        enemydist = parent.G.monsters[target.mtype].range + 20;
    else if (targetting === 1)
        enemydist = character.range - 20;
    else if (targetting === 2)
        enemydist = 90;
    //Targetting

    move_to_position(target, enemydist);
    //Movement

    prevx = Math.ceil(character.real_x);
    prevy = Math.ceil(character.real_y);
    //Sets new coords to prev coords

}, 200); // Loop Delay

function move_to_position(target, enemydist) //Movement Algorithm
{
    if(!angle && target)
        angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
    //Set Angle Just in Case
    
    var distmov = Math.sqrt(Math.pow(character.real_x - prevx, 2) + Math.pow(character.real_y - prevy, 2));
    //Distance Since Previous
    
    if(distmov < stuck)
        angle = angle + (Math.PI*2*0.125);
    
    move(target.real_x + enemydist * Math.cos(angle), target.real_y + enemydist * Math.sin(angle));
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