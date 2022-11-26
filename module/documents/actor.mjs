/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Double_CrossActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.double_cross || {};

    //derived stats
    //hp max value
    systemData.derived.health.max = ((2 * systemData.stats.body.value) + systemData.stats.mind.value + 20);
    //stock max value
    systemData.derived.stock.max = ((2 * systemData.stats.social.value) + (2 * systemData.skills.procure.value));
    //initiative
    systemData.derived.initiative = ((2 * systemData.stats.sense.value) + ( systemData.stats.mind.value));
    //move
    systemData.derived.move = (systemData.derived.initiative + 5);
    //dash
    systemData.derived.dash = ((systemData.derived.initiative + 5) * 2);
    //encroach level
    if (systemData.encroach.value >= 160){
      systemData.encroach.lvl = 2;
    } else if (systemData.encroach.value >= 100){
      systemData.encroach.lvl = 1;
    } else {
      systemData.encroach.lvl = 0;
    }
    //encroach dice
    if (systemData.encroach.value >= 300){
      systemData.encroach.dice = 8;
    } else if (systemData.encroach.value >= 240){
      systemData.encroach.dice = 7;
    } else if (systemData.encroach.value >= 200){
      systemData.encroach.dice = 6;
    } else if (systemData.encroach.value >= 160){
      systemData.encroach.dice = 5;
    } else if (systemData.encroach.value >= 130){
      systemData.encroach.dice = 4;
    } else if (systemData.encroach.value >= 100){
      systemData.encroach.dice = 3;
    } else if (systemData.encroach.value >= 80){
      systemData.encroach.dice = 2;
    } else if (systemData.encroach.value >= 60){
      systemData.encroach.dice = 1;
    } else {
      systemData.encroach.dice = 0;
    }

    //calculating breed
    let syncount = 0;
    actorData.items.toObject().forEach(item => {
      if (item.type == "syndrome"){
        syncount++;
      }
    })
    systemData.renegade.breed = CONFIG.breeds[syncount]
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    /*
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }*/
  }

}