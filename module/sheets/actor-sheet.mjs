import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Double_CrossActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["double_cross", "sheet", "actor"],
      template: "systems/double_cross/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "data" }]
    });
  }

  /** @override */
  get template() {
    return `systems/double_cross/templates/actor/actor-character-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    this._prepareItems(context);
    this._prepareCharacterData(context);

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();
    context.breeds = CONFIG.breeds;
    context.skillslist = CONFIG.skillslist;
    //context.syndromelist = CONFIG.syndromelist;
    //console.log("hiii!!");
    //console.log(context.breeds);
    //console.log(context.syndromelist);
    console.log(context);
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    /*
    for (let [k, v] of Object.entries(context.system.stats)) {
      v.label = game.i18n.localize(CONFIG.DOUBLECROSS.stats[k]) ?? k;
    }*/
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const powers = [];
    const armor = [];
    const weapons = [];
    const vehicles = [];
    const lois = [];
    const traitlois = [];
    const syndrome = [];
    const misc = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'power') {
        powers.push(i);
      } else if (i.type === 'armor') {
        armor.push(i);
      } else if (i.type === 'weapon') {
        weapons.push(i);
      } else if (i.type === 'vehicle') {
        vehicles.push(i);
      } else if (i.type === 'lois') {
        lois.push(i);
      } else if (i.type === 'traitlois') {
        traitlois.push(i);
      } else if (i.type === 'syndrome'){
        if (syndrome.length <= 3){
          syndrome.push(i);
        }
      } else if (i.type === 'misc') {
        misc.push(i);
      }
    }

    // Assign and return
    context.powers = powers;
    context.armor = armor;
    context.weapons = weapons;
    context.vehicles = vehicles;
    context.lois = lois;
    context.traitlois = traitlois;
    context.syndrome = syndrome;
    context.misc = misc;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      console.log(li);
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Edit an Item's values from the Actor Sheet
    html.find('.syn-dropdown').change(ev =>{
      console.log("Hi we're here!! smile")
      const id = $(ev.currentTarget).attr("target-id");
      const target = $(ev.currentTarget).attr("target-name");
      if (id) this.actor.items.get(id).update({[target]: ev.target.value});
    });

    // Active Effect management
    //html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    //html.find('.rollable').click(this._onRoll.bind(this));
    html.find('.rollable').click(this.dxRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    let name = `New ${type.capitalize()}`;
    if (type == 'syndrome'){
      name = '-';
    }
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];
    //console.log(this.actor);
    //console.log(itemData)
    //console.log(this)
    //console.log(this.actor.items)

    //syndrome checking
    let syncount = 0;
    this.actor.items.toObject().forEach(item => {
      if (item.type == "syndrome"){
        syncount++;
      }
    })
    if ((syncount == 3) && (type == "syndrome")){
      return;
    }
    
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log(dataset)

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  async dxRoll(event){
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log(dataset)

    let inputs = [
      {
          type: 'number',
          label: 'Num d10',
          options: '1'
      },    {
          type: 'number',
          label: 'Modifier',
          options: '0'
      },    {
          type: 'number',
          label: 'Crit Range',
          options: '10'
      }
  ]

  if (dataset.roll){
    let data = JSON.parse(dataset.roll);
    console.log(data);
    if (data[0] == -1){
      //skill, grab the associated stat
      let legend = {
        'melee':'body',
        'ranged':'sense',
        'rc':'mind',
        'negotiate':'social',
        'ride':'body',
        'art':'sense',
        'knowledge':'mind',
        'info':'social'
      }
      let key = legend[dataset.label.toLowerCase()];
      let value = this.actor.system.stats[key].value;
      console.log(value)
      data[0] = value;
    }
    inputs[0].options = data[0].toString();
    inputs[1].options = data[1].toString();
    inputs[2].options = data[2].toString();
  }
  console.log(inputs)
  const result = await warpgate.menu({inputs}, {title: 'Quick roll'});
  if (!result.buttons) return;
  console.log(result)
  const [num_of_dice, modifier, crit_range] = result.inputs;
  const flavor = "My flavor text here";
let crits = 0;
let loopy= 1;
let critLoop= crit_range;
/* --------------- */
const roll = new Roll(`${num_of_dice}d10 + ${modifier}`);
await roll.evaluate({async: true});
addCrits();

// set results to 10 if above crit range
function addCrits(){
    crits = 0;
    for(let result of roll.terms[0].results){
        if(result.result >= critLoop && !result.evaluated){
            result.result = 10*loopy;
            result.evaluated = true;
            crits++;
        }
    }
    if(crits > 0){
         for(let result of roll.terms[0].results){
            if(result.result >= critLoop){
               result.result = result.result+Math.ceil(Math.random()*10);
               result.evaluated = false;
            }
         }
        // recursive
        loopy=loopy+1;
        critLoop=critLoop+10;
        addCrits();
    }
}

//assume this is important


// find highest value
let highest = 0;
for(let result of roll.terms[0].results) if(result.result > highest) highest = result.result;

let highestValueIndex = roll.terms[0].results.findIndex(i => {return i.result === highest;});
for(let i = 0; i < roll.terms[0].results.length; i++){
    if(i === highestValueIndex) continue;
    roll.terms[0].results[i].active = false;
    roll.terms[0].results[i].discarded = true;
}
roll._total = highest + modifier;

roll.toMessage({flavor});

  }
}
