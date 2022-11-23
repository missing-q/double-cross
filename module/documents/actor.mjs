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
    const data = actorData.data;

    //derived stats
    //hp max value
    data.derived.health.max.value = ((2 * data.stats.body.value) + data.stats.mind.value + 20);
    //stock max value
    data.derived.stock.max.value = ((2 * data.stats.social.value) + (2 * data.skills.procure.value));
    //initiative
    data.derived.initiative.value = ((2 * data.stats.sense.value) + ( data.stats.mind.value));
    //move
    data.derived.move.value = (data.derived.initiative.value + 5);
    //dash
    data.derived.dash.value = ((data.derived.initiative.value + 5) * 2);
    //doom level
    if (data.doom.value >= 160){
      data.doomstats.doomlvl.value = 2;
    } else if (data.doom.value >= 100){
      data.doomstats.doomlvl.value = 1;
    } else {
      data.doomstats.doomlvl.value = 0;
    }
    //doom dice
    if (data.doom.value >= 300){
      data.doomstats.doomdice.value = 8;
    } else if (data.doom.value >= 240){
      data.doomstats.doomdice.value = 7;
    } else if (data.doom.value >= 200){
      data.doomstats.doomdice.value = 6;
    } else if (data.doom.value >= 160){
      data.doomstats.doomdice.value = 5;
    } else if (data.doom.value >= 130){
      data.doomstats.doomdice.value = 4;
    } else if (data.doom.value >= 100){
      data.doomstats.doomdice.value = 3;
    } else if (data.doom.value >= 80){
      data.doomstats.doomdice.value = 2;
    } else if (data.doom.value >= 60){
      data.doomstats.doomdice.value = 1;
    } else {
      data.doomstats.doomdice.value = 0;
    }
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