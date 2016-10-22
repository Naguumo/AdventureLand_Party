/* global character */

var targetting = 2;
//Monster Range = 0, Character Range = 1, Tank Range = 2

var prevx = 0;
var prevy = 0;
//Previous coords

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

var pos = 0;
var stuck = 2;
//Distance Maintainence Variables

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

    var leader = get_player(character.party);
    //Get Party Leader

    var target = get_targeted_monster();
    var ltarget = get_target_of(leader);
    if (!target || target !== ltarget)
    {
        change_target(ltarget);
        target = get_targeted_monster();
    }
    //Match Target with Leader

    if (target && can_attack(target))
        attack(target);
    //Attack

    if (pos >= 5)
        pos = 1;
    //Resetting Circle

    var enemydist;
    if (targetting === 0 && ltarget)
        enemydist = parent.G.monsters[ltarget.mtype].range + 20;
    else if (targetting === 1)
        enemydist = character.range - 20;
    else
        enemydist = 30;
    //Targetting

    if (ltarget && ltarget === target)
    {
        move_to_position(ltarget, enemydist);
        set_message("Attacking: " + target.name);
    }
    else
    {
        move(leader.real_x, leader.real_y);
        set_message("Following: " + leader.name);
    }
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
    if (disty === 2 && Math.abs(distx) > Math.abs(disty)) //Player is above enemy
        pos = 2;
    if (distx < 0 && Math.abs(distx) < Math.abs(disty)) //Player is right of enemy
        pos = 3;
    if (disty > 0 && Math.abs(distx) > Math.abs(disty)) //Player is below enemy
        pos = 4;
}