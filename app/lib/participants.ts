/**
 * Participants Management Module
 *
 * This module handles all operations related to the participants list,
 * including adding, validating, and selecting winners.
 *
 * The participants are the names displayed on the wheel segments,
 * and this module ensures they're properly formatted and managed.
 */

/**
 * Returns a default list of participants to populate the wheel initially
 *
 * This provides a starting point for users to see how the wheel works
 * before adding their own participants.
 *
 * @returns Array of default participant names
 */
export function getDefaultParticipants(): string[] {
  return [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eva",
    "Frank",
    "Grace",
    "Hannah",
  ];
}

/**
 * Adds a new participant to the list
 *
 * This function:
 * 1. Trims whitespace from the name
 * 2. Validates the name meets requirements
 * 3. Adds the name to the list if valid
 *
 * @param currentParticipants - Current list of participants
 * @param name - Name to add (will be trimmed)
 * @returns Updated list of participants with new name added
 */
export function addParticipant(
  currentParticipants: string[],
  name: string
): string[] {
  // Trim whitespace from the name
  const trimmedName = name.trim();

  // Don't add empty names
  if (trimmedName === "") {
    return currentParticipants;
  }

  // Don't add duplicate names (case insensitive check)
  if (
    currentParticipants.some(
      (p) => p.toLowerCase() === trimmedName.toLowerCase()
    )
  ) {
    return currentParticipants;
  }

  // Add the new name to the list
  return [...currentParticipants, trimmedName];
}

/**
 * Removes a participant at the specified index
 *
 * @param currentParticipants - Current list of participants
 * @param index - Index of participant to remove
 * @returns Updated list with the participant removed
 */
export function removeParticipant(
  currentParticipants: string[],
  index: number
): string[] {
  // Create a new array without the participant at the given index
  return currentParticipants.filter((_, i) => i !== index);
}

/**
 * Gets a random winner index from the participants array
 *
 * This is used by the wheel spinning animation to pre-determine
 * which participant will be the winner before the animation starts.
 *
 * @param participants - List of participants
 * @returns Random index between 0 and participants.length-1
 */
export function getRandomWinnerIndex(participants: string[]): number {
  // If no participants, return -1
  if (!participants.length) {
    return -1;
  }

  // Generate a random index within the array bounds
  return Math.floor(Math.random() * participants.length);
}

/**
 * Gets the name of the participant at the specified index
 *
 * Safely handles out-of-bounds indices by returning an empty string.
 * Used for displaying the current or winning participant.
 *
 * @param participants - List of participants
 * @param index - Index of participant to retrieve
 * @returns The participant name or empty string if index is invalid
 */
export function getParticipantName(
  participants: string[],
  index: number
): string {
  // Check if index is valid
  if (index >= 0 && index < participants.length) {
    return participants[index];
  }

  // Return empty string for invalid indices
  return "";
}

/**
 * Validates if a participant name is acceptable
 *
 * A valid name must be non-empty after trimming whitespace.
 *
 * @param name - Name to validate
 * @returns True if name is valid, false otherwise
 */
export function isValidParticipantName(name: string): boolean {
  return name.trim().length > 0;
}
