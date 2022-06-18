import React, { useEffect } from 'react';
import { useTable, usePagination } from 'react-table';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Text,
  Tooltip,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@chakra-ui/icons';

export default function TableWidget({
  columns,
  data,
  controlledPageCount,
  dataHandler,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: controlledPageCount,
    },
    usePagination,
  );

  useEffect(() => {
    async function sendData() {
      if (dataHandler) {
        await dataHandler({ pageIndex, pageSize });
      }
    }

    sendData();
  }, [dataHandler, pageIndex, pageSize]);

  return (
    <Box
      style={{
        maxHeight: '600px',
      }}
    >
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup, i) => (
            <Tr key={i} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, id) => (
                <Th key={id} {...column.getHeaderProps()}>
                  {column.render('Header')}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {page.map((row, idx) => {
            prepareRow(row);
            return (
              <Tr key={idx} {...row.getRowProps()}>
                {row.cells.map((cell, idxx) => (
                  <Td key={idxx} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Flex justifyContent='space-between' m={4} alignItems='center'>
        <Flex>
          <Tooltip label='First Page'>
            <IconButton
              onClick={() => gotoPage(0)}
              isDisabled={!canPreviousPage}
              icon={<ArrowLeftIcon h={3} w={3} />}
              mr={4}
              aria-label=''
            />
          </Tooltip>
          <Tooltip label='Previous Page'>
            <IconButton
              onClick={previousPage}
              isDisabled={!canPreviousPage}
              icon={<ChevronLeftIcon h={6} w={6} />}
              aria-label=''
            />
          </Tooltip>
        </Flex>

        <Flex alignItems='center'>
          <Text mr={8}>
            Page{' '}
            <Text fontWeight='bold' as='span'>
              {pageIndex + 1}
            </Text>{' '}
            of{' '}
            <Text fontWeight='bold' as='span'>
              {pageOptions.length}
            </Text>
          </Text>
          <Text>Go to page:</Text>{' '}
          <NumberInput
            ml={2}
            mr={8}
            w={28}
            min={1}
            max={pageOptions.length}
            onChange={(value) => {
              const pageID = Number(value) ? Number(value) - 1 : 0;
              gotoPage(pageID);
            }}
            defaultValue={pageIndex + 1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Select
            w={32}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSizeID) => (
              <option key={pageSizeID} value={pageSizeID}>
                Show {pageSizeID}
              </option>
            ))}
          </Select>
        </Flex>

        <Flex>
          <Tooltip label='Next Page'>
            <IconButton
              onClick={nextPage}
              isDisabled={!canNextPage}
              icon={<ChevronRightIcon h={6} w={6} />}
              aria-label=''
            />
          </Tooltip>
          <Tooltip label='Last Page'>
            <IconButton
              onClick={() => gotoPage(pageCount - 1)}
              isDisabled={!canNextPage}
              icon={<ArrowRightIcon h={3} w={3} />}
              ml={4}
              aria-label=''
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
}