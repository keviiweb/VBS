import { actions, levels } from '@constants/sys/admin';

/**
 * The different types of actions each level can perform
 */
const mappings = new Map();

// View admin pages
mappings.set(actions.VIEW_FULL_ADMIN_PAGE, [levels.JCRC, levels.KEWEB]);
mappings.set(actions.VIEW_ADMIN_PAGE, [
  levels.APPROVER,
  levels.JCRC,
  levels.KEWEB,
]);

// VBS - Booking and Booking Request
mappings.set(actions.FETCH_BOOKING, [
  levels.USER,
  levels.APPROVER,
  levels.JCRC,
  levels.KEWEB,
]);
mappings.set(actions.FETCH_BOOKING_REQUEST, [
  levels.APPROVER,
  levels.JCRC,
  levels.KEWEB,
]);
mappings.set(actions.MANAGE_BOOKING_REQUEST, [
  levels.APPROVER,
  levels.JCRC,
  levels.KEWEB,
]);
mappings.set(actions.CREATE_RECURRING_BOOKING_REQUEST, [
  levels.JCRC,
  levels.KEWEB,
]);

// Venue data for VBS
mappings.set(actions.CREATE_VENUE, [levels.KEWEB]);
mappings.set(actions.EDIT_VENUE, [levels.KEWEB]);

// Announcement feature
mappings.set(actions.CREATE_ANNOUNCEMENT, [levels.JCRC, levels.KEWEB]);
mappings.set(actions.EDIT_ANNOUNCEMENT, [levels.JCRC, levels.KEWEB]);
mappings.set(actions.DELETE_ANNOUNCEMENT, [levels.JCRC, levels.KEWEB]);

// CCA Attendance
mappings.set(actions.FETCH_ALL_CCA_ATTENDANCE, [levels.JCRC, levels.KEWEB]);

// CCA Session
mappings.set(actions.OVERRIDE_CREATE_SESSION, [levels.JCRC, levels.KEWEB]);
mappings.set(actions.OVERRIDE_EDIT_SESSION, [levels.JCRC, levels.KEWEB]);
mappings.set(actions.OVERRIDE_DELETE_SESSION, [levels.JCRC, levels.KEWEB]);

// CCA
mappings.set(actions.FETCH_ALL_CCA, [levels.JCRC, levels.KEWEB]);

// CCA Record
mappings.set(actions.POPULATE_CCA_RECORD, [levels.KEWEB]);
mappings.set(actions.FETCH_USER_CCA_RECORD, [levels.JCRC, levels.KEWEB]);

// KEIPS
mappings.set(actions.FETCH_ALL_KEIPS, [levels.KEWEB]);
mappings.set(actions.POPULATE_KEIPS, [levels.KEWEB]);
mappings.set(actions.DELETE_KEIPS, [levels.KEWEB]);

// Users
mappings.set(actions.CREATE_USER, [levels.KEWEB]);
mappings.set(actions.EDIT_USER, [levels.KEWEB]);
mappings.set(actions.FETCH_USER_DATA, [levels.JCRC, levels.KEWEB]);
mappings.set(actions.POPULATE_USER, [levels.KEWEB]);

/**
 * Check if the user has the permission to perform a certain action
 *
 * @param level Level of the user
 * @param action Type of action
 * @returns Boolean whether the action is permitted
 */
const hasPermission = (level: number, action: string): boolean => {
  if (isNaN(Number(level)) || level === null || level === undefined) {
    return false;
  }

  if (mappings.has(action)) {
    return mappings.get(action).includes(level);
  }

  return false;
};

export default hasPermission;
