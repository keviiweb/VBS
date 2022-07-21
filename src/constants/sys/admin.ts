/**
 * Levels define the permission granted for each user
 *
 * USER: Can only view CCA attendance, book venues
 *
 * ADMIN: Everything a USER does, as well as approve venue bookings,
 * see venue details etc
 *
 * OWNER: All permissions granted, including ability to add new users,
 * populate CCA records, and manage KEIPS.
 */
export const levels = {
  USER: 0,
  ADMIN: 1,
  OWNER: 2,
};
