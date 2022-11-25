/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/double_cross/templates/actor/parts/actor-items.html",
    "systems/double_cross/templates/actor/parts/actor-powers.html",
    "systems/double_cross/templates/actor/parts/actor-syndromes.html",
    "systems/double_cross/templates/actor/parts/actor-effects.html",
  ]);
};
