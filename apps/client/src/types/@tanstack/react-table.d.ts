import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right"
    export?:
      | boolean
      | {
          pdf?: boolean | { header?: string }
          csv?: boolean | { header?: string }
        }
  }

  interface FilterFns {
    filterRows: FilterFn<any>
  }
}