var purchase_pots = true; //Set to true in order to allow potion purchases
var pots_minimum = 50; //If you have less than this, you will buy
var pots_to_buy = 1000; //This is how many you will buy
//Buy Pots

var party_list = [
	{
		name: "Hajime",
		priority: 1.0
},
	{
		name: "Kuro",
		priority: 0.0
},
	{
		name: "",
		priority: 0.0
},
	{
		name: "",
		priority: 0.0
},
	{
		name: "",
		priority: 0.0
},
	{
		name: "",
		priority: 0.0
}, ]

var party_count = 0;

setInterval(function() {

	//Loot available chests
	loot();

	//Heal and restore mana if required
	if (character.hp / character.max_hp < 0.7) {
		parent.use('hp');
		if (character.hp <= 100)
			parent.socket.emit("transport", {
				to: "main"
			});
		//Panic Button
	}

	if (character.mp / character.max_mp < 0.3)
		parent.use('mp');
	//Constrained Healing

	//Place inside setInterval to check potions when turned on.
	if (purchase_pots) {
		purchase_potions();
	}

	//Set target to null;
	var target = null;
	//set_message(party_list[0].name);

	for (var x = 0; x < party_count; x++) {
		set_message("Setting Priority");
		target = get_player(party_list[x].name);
		set_message("Not broken!");
		set_message(target.name);
		if (target) change_target(target);
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
		if (target) change_target(target);
		heal(target);
		set_message("Healing");
	}

	if ((target.real_x != character.real_x) || (target.real_y != character.real_y) && !target.rip) {
		move(
			character.real_x + (target.real_x - character.real_x),
			character.real_y + (target.real_y - character.real_y)
		);
		set_message("Moving to Priority");
	}
}, 1000 / 4); // Loops every 1/4 seconds.

function purchase_potions() {
	set_message("Buying pots.");
	if (character.items[0].q < pots_minimum) {
		parent.buy("hpot0", pots_to_buy);
	}
	if (character.items[1].q < pots_minimum) {
		parent.buy("mpot0", pots_to_buy);
	}
}