import { actions, levels } from '@constants/sys/admin';

/**
 * The different types of actions each level can perform
 */
const mappings = new Map();

// View admin pages
mappings.set(actions.VIEW_FULL_ADMIN_PAGE, [levels.OWNER]);
mappings.set(actions.VIEW_ADMIN_PAGE, [levels.ADMIN, levels.OWNER]);

// VBS - Booking and Booking Request
mappings.set(actions.FETCH_BOOKING, [levels.USER, levels.ADMIN, levels.OWNER]);
mappings.set(actions.FETCH_BOOKING_REQUEST, [levels.ADMIN, levels.OWNER]);
mappings.set(actions.MANAGE_BOOKING_REQUEST, [levels.ADMIN, levels.OWNER]);
mappings.set(actions.CREATE_RECURRING_BOOKING_REQUEST, [levels.OWNER]);

// Venue data for VBS
mappings.set(actions.CREATE_VENUE, [levels.OWNER]);
mappings.set(actions.EDIT_VENUE, [levels.OWNER]);

// Announcement feature
mappings.set(actions.CREATE_ANNOUNCEMENT, [levels.ADMIN, levels.OWNER]);
mappings.set(actions.EDIT_ANNOUNCEMENT, [levels.ADMIN, levels.OWNER]);
mappings.set(actions.DELETE_ANNOUNCEMENT, [levels.ADMIN, levels.OWNER]);

// CCA Attendance
mappings.set(actions.FETCH_ALL_CCA_ATTENDANCE, [levels.ADMIN, levels.OWNER]);

// CCA Record
mappings.set(actions.POPULATE_CCA_RECORD, [levels.OWNER]);
mappings.set(actions.FETCH_USER_CCA_RECORD, [levels.ADMIN, levels.OWNER]);

// KEIPS
mappings.set(actions.FETCH_ALL_KEIPS, [levels.OWNER]);
mappings.set(actions.POPULATE_KEIPS, [levels.OWNER]);
mappings.set(actions.DELETE_KEIPS, [levels.OWNER]);

// Users
mappings.set(actions.CREATE_USER, [levels.OWNER]);
mappings.set(actions.EDIT_USER, [levels.OWNER]);
mappings.set(actions.FETCH_USER_DATA, [levels.ADMIN, levels.OWNER]);
mappings.set(actions.POPULATE_USER, [levels.OWNER]);

/**
 * Check if the user has the permission to perform a certain action
 *
 * @param level Level of the user
 * @param action Type of action
 * @returns Boolean whether the action is permitted
 */
const hasPermission = (level: number, action: string): boolean => {
  if (isNaN(level) || level === null || level !== undefined) {
    return false;
  }

  if (mappings.has(action)) {
    return mappings.get(action).includes(level);
  }

  return false;
};

export default hasPermission;
