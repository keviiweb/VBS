import {
  type UseColumnOrderInstanceProps,
  type UseColumnOrderState,
  type UseExpandedHooks,
  type UseExpandedInstanceProps,
  type UseExpandedOptions,
  type UseExpandedRowProps,
  type UseExpandedState,
  type UseFiltersColumnOptions,
  type UseFiltersColumnProps,
  type UseFiltersInstanceProps,
  type UseFiltersOptions,
  type UseFiltersState,
  type UseGlobalFiltersColumnOptions,
  type UseGlobalFiltersInstanceProps,
  type UseGlobalFiltersOptions,
  type UseGlobalFiltersState,
  type UseGroupByCellProps,
  type UseGroupByColumnOptions,
  type UseGroupByColumnProps,
  type UseGroupByHooks,
  type UseGroupByInstanceProps,
  type UseGroupByOptions,
  type UseGroupByRowProps,
  type UseGroupByState,
  type UsePaginationInstanceProps,
  type UsePaginationOptions,
  type UsePaginationState,
  type UseResizeColumnsColumnOptions,
  type UseResizeColumnsColumnProps,
  type UseResizeColumnsOptions,
  type UseResizeColumnsState,
  type UseRowSelectHooks,
  type UseRowSelectInstanceProps,
  type UseRowSelectOptions,
  type UseRowSelectRowProps,
  type UseRowSelectState,
  type UseRowStateCellProps,
  type UseRowStateInstanceProps,
  type UseRowStateOptions,
  type UseRowStateRowProps,
  type UseRowStateState,
  type UseSortByColumnOptions,
  type UseSortByColumnProps,
  type UseSortByHooks,
  type UseSortByInstanceProps,
  type UseSortByOptions,
  type UseSortByState,
} from 'react-table';

declare module 'react-table' {
  export interface TableOptions<D extends Record<string, unknown>>
    extends UseExpandedOptions<D>,
      UseFiltersOptions<D>,
      UseGlobalFiltersOptions<D>,
      UseGroupByOptions<D>,
      UsePaginationOptions<D>,
      UseResizeColumnsOptions<D>,
      UseRowSelectOptions<D>,
      UseRowStateOptions<D>,
      UseSortByOptions<D>,
      Record<string, any> {}

  export interface Hooks<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseExpandedHooks<D>,
      UseGroupByHooks<D>,
      UseRowSelectHooks<D>,
      UseSortByHooks<D> {}

  export interface TableInstance<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseColumnOrderInstanceProps<D>,
      UseExpandedInstanceProps<D>,
      UseFiltersInstanceProps<D>,
      UseGlobalFiltersInstanceProps<D>,
      UseGroupByInstanceProps<D>,
      UsePaginationInstanceProps<D>,
      UseRowSelectInstanceProps<D>,
      UseRowStateInstanceProps<D>,
      UseSortByInstanceProps<D> {}

  export interface TableState<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseColumnOrderState<D>,
      UseExpandedState<D>,
      UseFiltersState<D>,
      UseGlobalFiltersState<D>,
      UseGroupByState<D>,
      UsePaginationState<D>,
      UseResizeColumnsState<D>,
      UseRowSelectState<D>,
      UseRowStateState<D>,
      UseSortByState<D> {}

  export interface ColumnInterface<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseFiltersColumnOptions<D>,
      UseGlobalFiltersColumnOptions<D>,
      UseGroupByColumnOptions<D>,
      UseResizeColumnsColumnOptions<D>,
      UseSortByColumnOptions<D> {}

  export interface ColumnInstance<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseFiltersColumnProps<D>,
      UseGroupByColumnProps<D>,
      UseResizeColumnsColumnProps<D>,
      UseSortByColumnProps<D> {}

  export interface Cell<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseGroupByCellProps<D>,
      UseRowStateCellProps<D> {}

  export interface Row<
    D extends Record<string, unknown> = Record<string, unknown>,
  > extends UseExpandedRowProps<D>,
      UseGroupByRowProps<D>,
      UseRowSelectRowProps<D>,
      UseRowStateRowProps<D> {}
}
