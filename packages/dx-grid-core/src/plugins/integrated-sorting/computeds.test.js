import { sortedRows } from './computeds';

describe('IntegratedSorting computeds', () => {
  describe('#sortedRows', () => {
    const getCellValue = (row, columnName) => row[columnName];

    describe('plain rows', () => {
      const rows = [
        { a: 2, b: 2 },
        { a: 1, b: 1 },
        { a: 2, b: 1 },
        { a: 1, b: 2 },
      ];

      it('does not mutate grid rows if no sorting specified', () => {
        const sorting = [];

        const sorted = sortedRows(rows, sorting, getCellValue);
        expect(sorted).toBe(rows);
      });

      it('can sort ascending by one column', () => {
        const sorting = [{ columnName: 'a', direction: 'asc' }];

        const sorted = sortedRows(rows, sorting, getCellValue);
        expect(sorted).toEqual([
          { a: 1, b: 1 },
          { a: 1, b: 2 },
          { a: 2, b: 2 },
          { a: 2, b: 1 },
        ]);
      });

      it('can sort descending by one column', () => {
        const sorting = [{ columnName: 'a', direction: 'desc' }];

        const sorted = sortedRows(rows, sorting, getCellValue);
        expect(sorted).toEqual([
          { a: 2, b: 2 },
          { a: 2, b: 1 },
          { a: 1, b: 1 },
          { a: 1, b: 2 },
        ]);
      });

      it('can sort by several columns', () => {
        const sorting = [{ columnName: 'a', direction: 'asc' }, { columnName: 'b', direction: 'asc' }];

        const sorted = sortedRows(rows, sorting, getCellValue);
        expect(sorted).toEqual([
          { a: 1, b: 1 },
          { a: 1, b: 2 },
          { a: 2, b: 1 },
          { a: 2, b: 2 },
        ]);
      });

      it('can sort by several columns with different directions', () => {
        const sorting = [{ columnName: 'a', direction: 'asc' }, { columnName: 'b', direction: 'desc' }];

        const sorted = sortedRows(rows, sorting, getCellValue);
        expect(sorted).toEqual([
          { a: 1, b: 2 },
          { a: 1, b: 1 },
          { a: 2, b: 2 },
          { a: 2, b: 1 },
        ]);
      });

      it('can sort using custom compare', () => {
        const getColumnCompare = jest.fn();

        getColumnCompare.mockImplementation(() => (a, b) => {
          if (a === b) {
            return 0;
          }
          return a < b ? 1 : -1;
        });
        const sorting = [{ columnName: 'a', direction: 'desc' }];
        const sorted = sortedRows(rows, sorting, getCellValue, getColumnCompare);

        expect(getColumnCompare).toBeCalledWith(sorting[0].columnName);
        expect(sorted).toEqual([
          { a: 1, b: 1 },
          { a: 1, b: 2 },
          { a: 2, b: 2 },
          { a: 2, b: 1 },
        ]);
      });

      it('should use default compare if custom compare returns nothing', () => {
        const getColumnCompare = () => undefined;
        const sorting = [{ columnName: 'a', direction: 'desc' }];
        const sorted = sortedRows(rows, sorting, getCellValue, getColumnCompare);

        expect(sorted).toEqual([
          { a: 2, b: 2 },
          { a: 2, b: 1 },
          { a: 1, b: 1 },
          { a: 1, b: 2 },
        ]);
      });

      it('should correctly sort column with \'undefined\' values', () => {
        const spacedRows = [
          { a: 1 },
          { a: 2, b: 1 },
          { a: 3, b: 2 },
          { a: 4 },
        ];
        const getColumnCompare = () => undefined;
        const sorting = [{ columnName: 'b', direction: 'asc' }];
        const sorted = sortedRows(spacedRows, sorting, getCellValue, getColumnCompare);

        expect(sorted).toEqual([
          { a: 2, b: 1 },
          { a: 3, b: 2 },
          { a: 1 },
          { a: 4 },
        ]);
      });

      it('should correctly sort column with \'null\' values', () => {
        const spacedRows = [
          { a: 1, b: null },
          { a: 2, b: 1 },
          { a: 3, b: 2 },
          { a: 4, b: null },
        ];
        const getColumnCompare = () => undefined;
        const sorting = [{ columnName: 'b', direction: 'asc' }];
        const sorted = sortedRows(spacedRows, sorting, getCellValue, getColumnCompare);

        expect(sorted).toEqual([
          { a: 2, b: 1 },
          { a: 3, b: 2 },
          { a: 1, b: null },
          { a: 4, b: null },
        ]);
      });

      it('should correctly sort column with \'null\' and \'undefined\' values', () => {
        const spacedRows = [
          { a: 1, b: null },
          { a: 2, b: 1 },
          { a: 3, b: undefined },
          { a: 4, b: 0 },
          { a: 5, b: 2 },
          { a: 6, b: null },
        ];
        const getColumnCompare = () => undefined;
        const sorting = [{ columnName: 'b', direction: 'asc' }];
        const sorted = sortedRows(spacedRows, sorting, getCellValue, getColumnCompare);

        expect(sorted).toEqual([
          { a: 4, b: 0 },
          { a: 2, b: 1 },
          { a: 5, b: 2 },
          { a: 1, b: null },
          { a: 6, b: null },
          { a: 3, b: undefined },
        ]);
      });
    });

    describe('grouped rows', () => {
      const groupRow = ({ groupedBy, ...restParams }) => ({
        ...restParams,
        groupedBy,
        group: true,
        levelKey: groupedBy,
      });
      const isGroupRow = row => row.group;
      const getRowLevelKey = row => row.levelKey;

      it('should sort grouped rows', () => {
        /* eslint-disable indent */
        const groupedRows = [
          groupRow({ groupedBy: 'a', value: 1 }),
            groupRow({ groupedBy: 'b', value: 1 }),
            groupRow({ groupedBy: 'b', value: 2 }),
              { c: 1 },
              { c: 2 },
          groupRow({ groupedBy: 'a', value: 2 }),
        ];
        /* eslint-enable indent */
        const sorting = [
          { columnName: 'a', direction: 'desc' },
          { columnName: 'b', direction: 'desc' },
          { columnName: 'c', direction: 'desc' },
        ];
        /* eslint-disable indent */
        const sortedGroupedRows = [
          groupRow({ groupedBy: 'a', value: 2 }),
          groupRow({ groupedBy: 'a', value: 1 }),
            groupRow({ groupedBy: 'b', value: 2 }),
              { c: 2 },
              { c: 1 },
            groupRow({ groupedBy: 'b', value: 1 }),
        ];
        /* eslint-enable indent */

        expect(sortedRows(
          groupedRows,
          sorting,
          getCellValue,
          () => undefined,
          isGroupRow,
          getRowLevelKey,
        ))
          .toEqual(sortedGroupedRows);
      });
    });

    describe('hierarchical rows', () => {
      const rowNode = ({ level, ...restParams }) => ({
        ...restParams,
        levelKey: `tree_${level}`,
      });
      const getRowLevelKey = row => row.levelKey;

      it('should sort grouped rows', () => {
        /* eslint-disable indent */
        const hierarchicalRows = [
          rowNode({ level: 0, a: 1 }),
            rowNode({ level: 1, b: 1 }),
            rowNode({ level: 1, b: 2 }),
              { c: 1 },
              { c: 2 },
          rowNode({ level: 0, a: 2 }),
        ];
        /* eslint-enabke indent */
        const sorting = [
          { columnName: 'a', direction: 'desc' },
          { columnName: 'b', direction: 'desc' },
          { columnName: 'c', direction: 'desc' },
        ];
        /* eslint-disable indent */
        const sortedHierarchicalRows = [
          rowNode({ level: 0, a: 2 }),
          rowNode({ level: 0, a: 1 }),
            rowNode({ level: 1, b: 2 }),
              { c: 2 },
              { c: 1 },
            rowNode({ level: 1, b: 1 }),
        ];
        /* eslint-enable indent */

        expect(sortedRows(
          hierarchicalRows,
          sorting,
          getCellValue,
          () => undefined,
          undefined,
          getRowLevelKey,
        ))
          .toEqual(sortedHierarchicalRows);
      });
    });
  });
});
