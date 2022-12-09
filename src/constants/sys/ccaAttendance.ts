import { CCAAttendance } from 'types/cca/ccaAttendance';

/**
 * Remove duplicates from CCAAttendance Array
 *
 * @param dataField CCAAttendance array
 * @returns Same array with duplicates removed
 */
export const removeDuplicate = (
  dataField: CCAAttendance[],
): CCAAttendance[] => {
  const removedDuplicateData: CCAAttendance[] = dataField.filter(
    (arr, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.sessionEmail === arr.sessionEmail ||
          t.sessionName === arr.sessionName,
      ),
  );

  return removedDuplicateData;
};
