/**
 * Custom types for the application
 */

/**
 * Represents a cat with name and age properties
 * @interface
 */
export interface LizCat {
  name: string;
  age: number;
}

/**
 * Type representing the createCat function
 */
export type CreateCatGeneratedType = (name: string) => LizCat;

/**
 * Creates a new LizCat with the specified name and age 0
 * @param {string} name - The name to assign to the cat
 * @returns {LizCat} A newly created LizCat with the specified name and age 0
 */
export function createCat(name: string): LizCat {
  return {
    name,
    age: 0,
  };
}
