/* global character */

var targetting = 2;
//Monster Range = 0, Character Range = 1, Tank Range = 2

var prevx = 0;
var prevy = 0;
//Previous coords

var potmin = 50;
var pot2buy = 1000;
//Pot Maintainence

var angle;
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
    if ((!target || target !== ltarget) && ltarget)
    {
        change_target(ltarget);
        target = get_targeted_monster();
        angle = Math.atan2(character.real_y - target.real_y, character.real_x - target.real_x);
    }
    //Match Target with Leader

    if (target && can_attack(target))
        attack(target);
    //Attack

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
        set_message("Attacking: " + target.mtype);
    }
    else if(leader)
    {
        move(leader.real_x, leader.real_y);
        set_message("Following: " + leader.name);
    }
	else
		set_message("Lost");
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