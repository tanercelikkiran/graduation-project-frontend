/**
 * Base option interface that some transformation options extend from.
 * Note: PyramidParaphOptions does not extend this directly.
 */
interface PyramidOptionsBase {
  sentence: string; // The resulting sentence of the operation for most types
  meaning: string;
}

/**
 * Option for shrinking a sentence by removing a word
 */
interface PyramidShrinkOptions extends PyramidOptionsBase {
  removed_word: string;
}

/**
 * Option for expanding a sentence by adding a word
 */
interface PyramidExpandOptions extends PyramidOptionsBase {
  expand_word: string;
}

/**
 * Option for replacing a word in a sentence
 */
interface PyramidReplaceOptions extends PyramidOptionsBase {
  changed_word: string; // The new word
  replaced_word: string; // The original word that was replaced
}

/**
 * Option for paraphrasing a sentence.
 * Does not extend PyramidOptionsBase to avoid 'sentence' field confusion.
 */
interface PyramidParaphOptions {
  paraphrased_sentence: string; // The paraphrased sentence itself
  meaning: string;
}

/**
 * Union type for all concrete option types.
 */
type PyramidOptionConcreteTypes =
  | PyramidShrinkOptions
  | PyramidExpandOptions
  | PyramidReplaceOptions
  | PyramidParaphOptions;

/**
 * Base pyramid item interface with generic option type.
 * T is constrained by PyramidOptionConcreteTypes.
 */
interface PyramidItemBase<T extends PyramidOptionConcreteTypes> {
  step_type: string; // Will be narrowed down by specific item types like "shrink", "expand"
  initial_sentence: string;
  initial_sentence_meaning: string;
  options: T[];
  selected_option?: number; // Index of the option selected by the user
  selected_sentence?: string; // The actual sentence string corresponding to the selected_option
}

/**
 * Specialized pyramid item interfaces
 */
interface PyramidShrinkItem extends PyramidItemBase<PyramidShrinkOptions> {
  step_type: "shrink";
}

interface PyramidExpandItem extends PyramidItemBase<PyramidExpandOptions> {
  step_type: "expand";
}

interface PyramidReplaceItem extends PyramidItemBase<PyramidReplaceOptions> {
  step_type: "replace";
}

interface PyramidParaphItem extends PyramidItemBase<PyramidParaphOptions> {
  step_type: "paraphrase";
}

/**
 * Union type for all pyramid items. This is what `steps` arrays will contain.
 */
type PyramidItem =
  | PyramidExpandItem
  | PyramidShrinkItem
  | PyramidReplaceItem
  | PyramidParaphItem;

/**
 * Main pyramid output interface, received from the backend.
 */
interface PyramidOut {
  id: string;
  step_types: string[]; // e.g., ["expand", "shrink", "replace", "paraphrase"]
  steps: PyramidItem[];
  total_steps: number;
  last_step: number; // 0-indexed
  completed: boolean; // Indicates if the pyramid exercise is completed
  // Optional: created_at and updated_at can be added if needed from backend's Pyramid model
  // created_at?: string; // ISO date string
  // updated_at?: string; // ISO date string
}

/**
 * Interface for pyramid updates (Kept as per user's file, usage may vary).
 * This might be for replacing an entire step, which is different from our append/selection logic.
 */
interface PyramidUpdate {
  id: string;
  new_step: PyramidItem;
  last_step: number;
}

/**
 * Interface for pyramid input with user information (Kept as per user's file).
 * Represents the full pyramid data structure as stored in the backend, including user_id.
 * Frontend typically doesn't construct this directly for API calls but might use for typing if fetching raw DB data.
 */
interface PyramidIn {
  id: string; // Usually refers to _id from MongoDB
  user_id: string;
  step_types: string[];
  steps: PyramidItem[];
  total_steps: number;
  last_step: number;
  completed: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

/**
 * Base pyramid structure without ID or user-specific info (Kept as per user's file).
 * Might be used for defining the core structure of a pyramid.
 */
interface Pyramid {
  step_types: string[];
  steps: PyramidItem[];
  total_steps: number;
  last_step: number;
  completed: boolean;
}

// Export all types
export type {
  PyramidOptionsBase,
  PyramidShrinkOptions,
  PyramidExpandOptions,
  PyramidReplaceOptions,
  PyramidParaphOptions,
  PyramidOptionConcreteTypes, // Exporting the concrete union type
  PyramidItemBase,
  PyramidShrinkItem,
  PyramidExpandItem,
  PyramidReplaceItem,
  PyramidParaphItem,
  PyramidItem,
  PyramidOut,
  PyramidUpdate,
  PyramidIn,
  Pyramid,
};
